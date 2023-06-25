import { get, writable, type Writable } from 'svelte/store';

// config
const DEBUG = true;

let config: StoreConfig = {
	retryCount: 5,
	retryBackoffTime: 200
};

export type StoreConfig = {
	retryCount: number;
	retryBackoffTime: number;
};

export function getConfig(): StoreConfig {
	return config;
}

export function updateConfig(updated: StoreConfig) {
	config = updated;
}

class QueryCache {
	private cache: { [key: string]: CacheValue<unknown> } = {};

	constructor() {
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get<T>(key: any[]): CacheValue<T> {
		const serialized = this.serializeKey(key);
		const value = this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[serialized]);
		if (!value) throw new Error('Key not found');
		return value;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	has(key: any[]): boolean {
		const serialized = this.serializeKey(key);
		if (this.coerceAndCheckUnknown(this.cache[serialized])) {
			return true;
		}
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	refreshIfStale(key: any[]) {
		this.refresh(key);
	}

	// TODO: This shoudl just set data as stale and call refresh
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	invalidate(key: any[]) {
		this.refresh(key);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set<T>(key: any[], fn: QueryFn<T>, options?: QueryOptions<T>): CacheValue<T> {
		if (DEBUG) console.log(`creating: ${key}`);
		const serialized = this.serializeKey(key);
		const value = {
			function: fn,
			store: writable({
				isLoading: true,
				isError: false,
				data: undefined
			})
		};

		const existing = this.getSerialized<T>(serialized);
		if (existing) return existing;

		this.cache[serialized] = value;
		this.tryFunction(value);

		return value;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private refresh(key: any[]) {
		if (DEBUG) console.log(`refreshing: ${key}`);
		try {
			const cacheValue = this.get(key);
			cacheValue.store.update((v) => {
				v.isLoading = true;
				return v;
			});
			this.tryFunction(cacheValue);
		} catch {
			return;
		}
	}

	private tryFunction(cacheValue: CacheValue<unknown>, tryCount = 0) {
		if (DEBUG) console.log(`executing fn - try ${tryCount}`);
		if (tryCount < config.retryBackoffTime) {
			cacheValue
				.function()
				.then((v) => this.updateStoreValue(cacheValue, v))
				.catch(() => {
					cacheValue.store.update((v) => {
						v.isError = true;
						return v;
					});
					tryCount = tryCount + 1;
					if (DEBUG) console.log(`retry: ${tryCount}`);
					setTimeout(() => {
						this.tryFunction(cacheValue, tryCount);
					}, tryCount * config.retryBackoffTime);
				});
		}
	}

	private updateStoreValue<T>(cacheValue: CacheValue<T>, value: T) {
		cacheValue.store.update((store) => {
			store.isLoading = false;
			store.isError = false;
			store.data = value;
			return store;
		});
		return cacheValue;
	}

	private getSerialized<T>(key: string): CacheValue<T> | undefined {
		return this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[key]);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private serializeKey(key: any[]): string {
		// if its an object sort keys by alphabetical
		return key.join('|');
	}

	private coerceAndCheckUnknown<T>(value: unknown): T | undefined {
		if (typeof value === 'undefined' || value === null) {
			return undefined;
		}

		return value as T;
	}
}

export type QueryFn<T> = () => Promise<T>;
export type QueryOptions<T> = {
	staleTime?: number;
};

export type CacheValue<T> = {
	function: QueryFn<T>;
	store: Writable<StoreValue<T>>;
};

export type StoreValue<T> = {
	isError: boolean;
	isLoading: boolean;
	data: T | undefined;
};

export type QueryConfig = {
	staleTime: 1000;
};

const cache = new QueryCache();

export function createQuery<T>(
	key: string[],
	fn: QueryFn<T>,
	options?: QueryOptions<T>
): Writable<StoreValue<T>> {
	if (cache.has(key)) {
		cache.refreshIfStale(key);
		return cache.get<T>(key).store;
	}

	const value = cache.set(key, fn, options);
	return value.store;
}

export type MutatorArgs<T> = Array<T[keyof T]>;

export class Mutator<TStore, TArgs> {
	private key: string[];
	private fn: (...args: MutatorArgs<TArgs>) => Promise<void>;
	private optimisticMutateFn?: (data: TStore, ...args: MutatorArgs<TArgs>) => TStore;

	private onSuccessFn?: (...args: MutatorArgs<TArgs>) => void;
	private onErrorFn?: (...args: MutatorArgs<TArgs>) => void;

	public isLoading = false;
	public isError = false;

	constructor(
		key: string[],
		fn: (...args: MutatorArgs<TArgs>) => Promise<void>,
		options?: {
			optimisticMutateFn?: (data: TStore, ...args: MutatorArgs<TArgs>) => TStore;
			onSuccessFn?: (...args: MutatorArgs<TArgs>) => void;
			onErrorFn?: (...args: MutatorArgs<TArgs>) => void;
		}
	) {
		this.key = key;
		this.fn = fn;
		this.optimisticMutateFn = options?.optimisticMutateFn;
		this.onSuccessFn = options?.onSuccessFn;
		this.onErrorFn = options?.onErrorFn;
	}

	public mutate(...args: MutatorArgs<TArgs>) {
		this.isLoading = true;
		this.isError = false;

		if (DEBUG) console.log(`mutating v2 ${this.key}`);

		const cacheValue = cache.get<TStore>(this.key);
		const currentValue = get(cacheValue.store).data; // NOTE: This is not very performant.

		// FIXME: Surely a better way to do this - just want to rollback on failure
		const copiedValue = JSON.parse(JSON.stringify(currentValue));

		if (this.optimisticMutateFn && currentValue) {
			const updated = this.optimisticMutateFn(currentValue, ...args);
			cacheValue.store.update((store) => {
				store.data = updated;
				return store;
			});
		}

		this.fn(...args)
			.then(() => {
				cache.invalidate(this.key);

				if (this.onSuccessFn) {
					this.onSuccessFn(...args);
				}
			})
			.catch(() => {
				this.isError = true;
				if (DEBUG) console.log(`error mutating: ${this.key}`);
				if (this.onErrorFn) {
					this.onErrorFn(...args);
				}
				if (this.optimisticMutateFn) {
					cacheValue.store.update((store) => {
						store.data = copiedValue;
						return store;
					});
				}
			})
			.finally(() => {
				this.isLoading = false;
			});
	}
}

export function mutate<TStore, TArgs>(
	key: string[],
	fn: (...args: MutatorArgs<TArgs>) => Promise<void>,
	options?: {
		optimisticMutateFn?: (data: TStore, ...args: MutatorArgs<TArgs>) => TStore;
		onSuccessFn?: (...args: MutatorArgs<TArgs>) => void;
		onErrorFn?: (...args: MutatorArgs<TArgs>) => void;
	}
): Writable<Mutator<TStore, TArgs>> {
	const mutator = new Mutator(key, fn, options);
	return writable(mutator);
}
