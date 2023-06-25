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
	set<T>(key: any[], fn: QueryFn<T>, options?: QueryOptions<T>): CacheValue<T> {
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
		return value;
	}

	private getSerialized<T>(key: string): CacheValue<T> | undefined {
		return this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[key]);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private serializeKey(key: any[]): string {
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
		refresh(key);
		return cache.get<T>(key).store;
	}

	if (DEBUG) console.log(`creating: ${key}`);

	const value = cache.set(key, fn, options);
	tryFunction(value, fn);
	return value.store;
}

function tryFunction<T>(cacheValue: CacheValue<T>, fn: QueryFn<T>, tryCount = 0) {
	if (DEBUG) console.log(`executing fn - try ${tryCount}`);
	if (tryCount < config.retryBackoffTime) {
		fn()
			.then((v) => updateStoreValue(cacheValue, v))
			.catch(() => {
				cacheValue.store.update((v) => {
					v.isError = true;
					return v;
				});
				tryCount = tryCount + 1;
				if (DEBUG) console.log(`retry: ${tryCount}`);
				setTimeout(() => {
					tryFunction<T>(cacheValue, fn, tryCount);
				}, tryCount * config.retryBackoffTime);
			});
	}
}

export function refresh<T>(key: string[]) {
	if (DEBUG) console.log(`refreshing: ${key}`);
	if (!cache.has(key)) return;

	const cacheValue = cache.get<T>(key);
	cacheValue.store.update((v) => {
		v.isLoading = true;
		return v;
	});

	tryFunction(cacheValue, cacheValue.function);
}

export class Mutator<TStore, TArgs> {
	private key: string[];
	private fn: (...args: Array<TArgs[keyof TArgs]>) => Promise<void>;
	private optimisticMutateFn?: (data: TStore, ...args: Array<TArgs[keyof TArgs]>) => TStore;

	private onSuccessFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
	private onErrorFn?: (...args: Array<TArgs[keyof TArgs]>) => void;

	public isLoading = false;
	public isError = false;

	constructor(
		key: string[],
		fn: (...args: Array<TArgs[keyof TArgs]>) => Promise<void>,
		options?: {
			optimisticMutateFn?: (data: TStore, ...args: Array<TArgs[keyof TArgs]>) => TStore;
			onSuccessFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
			onErrorFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
		}
	) {
		this.key = key;
		this.fn = fn;
		this.optimisticMutateFn = options?.optimisticMutateFn;
		this.onSuccessFn = options?.onSuccessFn;
		this.onErrorFn = options?.onErrorFn;
	}

	public mutate(...args: Array<TArgs[keyof TArgs]>) {
		this.isLoading = true;
		this.isError = false;

		if (DEBUG) console.log(`mutating v2 ${this.key}`);

		const cacheValue = cache.get<TStore>(this.key);
		const currentValue = get(cacheValue.store).data;
		const copiedValue = JSON.parse(JSON.stringify(currentValue));

		// NOTE: For me later, this happens for looading is triggered
		// because loading is only triggered once the refetch has started
		if (this.optimisticMutateFn && currentValue) {
			const updated = this.optimisticMutateFn(currentValue, ...args);
			cacheValue.store.update((store) => {
				store.data = updated;
				return store;
			});
		}

		this.fn(...args)
			.then(() => {
				if (cacheValue) {
					refresh(this.key);
				}

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
	fn: (...args: Array<TArgs[keyof TArgs]>) => Promise<void>,
	options?: {
		optimisticMutateFn?: (data: TStore, ...args: Array<TArgs[keyof TArgs]>) => TStore;
		onSuccessFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
		onErrorFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
	}
): Writable<Mutator<TStore, TArgs>> {
	const mutator = new Mutator(key, fn, options);
	return writable(mutator);
}

function updateStoreValue<T>(cacheValue: CacheValue<T>, value: T) {
	cacheValue.store.update((store) => {
		store.isLoading = false;
		store.isError = false;
		store.data = value;
		return store;
	});
	return cacheValue;
}
