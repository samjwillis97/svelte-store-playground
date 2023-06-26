import { get, writable, type Unsubscriber, type Writable } from 'svelte/store';

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
		console.log('ctor');
		// So this gets called every time this file gets reloaded
		return this;
	}

	// get, returns the value in the cache or throws an error if
	// it doesn't exist
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get<T>(key: any[]): CacheValue<T> {
		console.log(JSON.stringify(Array.from(Object.keys(this.cache))));
		const serialized = this.serializeKey(key);
		const value = this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[serialized]);
		if (!value) throw new Error('Key not found');
		return value;
	}

	// set, will create a new Cache value and store it in the cache
	// with the key, it will also start a subsciption to refresh if stale.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set<T>(key: any[], fn: QueryFn<T>, options?: QueryOptions<T>): CacheValue<T> {
		console.log(JSON.stringify(Array.from(Object.keys(this.cache))));
		console.log('ATTEMPTING SET');
		if (DEBUG) console.log(`creating: ${key}`);
		const serialized = this.serializeKey(key);
		const value: CacheValue<T> = {
			function: fn,
			options: options ?? {},
			store: writable({
				isLoading: true,
				isError: false,
				isStale: false,
				data: undefined
			})
		};

		const existing = this.getSerialized<T>(serialized);
		if (existing) return existing;

		console.log(`NEW SET CREATED ${key}`);
		// FIXME: Still seems to be bug here when vite refreshes
		// Its like there is a new instance for each refresh?
		value.isStaleSubscription = value.store.subscribe((v) => {
			if (v.isStale && !v.isLoading) {
				if (DEBUG) console.log('refreshing stale data');
				value.store.update((value) => {
					value.isLoading = true;
					return value;
				});
				this.tryFunction(value);
			}
		});

		this.cache[serialized] = value;
		this.tryFunction(value);

		return value;
	}

	// has, checks whether the key exists in the cache or not
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	has(key: any[]): boolean {
		console.log(JSON.stringify(Array.from(Object.keys(this.cache))));
		const serialized = this.serializeKey(key);
		if (this.coerceAndCheckUnknown(this.cache[serialized])) {
			return true;
		}
		return false;
	}

	// refreshIfStale, first checks if the data is stale before
	// refreshing it, otherwise does nothing.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	refreshIfStale(key: any[]) {
		try {
			if (get(this.get(key).store).isStale) {
				this.refresh(key);
			}
		} catch {
			console.warn('Unable to refresh store');
		}
	}

	// invalidate, will set the data stale and loading and also
	// execute the function to refresh it.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	invalidate(key: any[]) {
		try {
			const cacheValue = this.get(key);
			cacheValue.store.update((value) => {
				value.isStale = true;
				value.isLoading = true;
				return value;
			});
			this.tryFunction(cacheValue);
		} catch {
			console.warn('Unable to invalidate and refresh store');
		}
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
		if (tryCount < config.retryCount) {
			cacheValue
				.function()
				.then((v) => this.setStoreValue(cacheValue, v))
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

	private setStoreValue<T>(cacheValue: CacheValue<T>, value: T) {
		cacheValue.store.update((store) => {
			store.isLoading = false;
			store.isError = false;
			store.isStale = false;
			store.data = value;
			return store;
		});

		clearTimeout(cacheValue.staleTimer);
		cacheValue.staleTimer = undefined;

		this.startStaleTimer(cacheValue);

		return cacheValue;
	}

	// This would be better as events of callbacks or something, checkout the notify manager on tanstack
	// TODO: Probably shouldn't auto-fetch data if tab is in background etc. Not sure how to handle that
	private startStaleTimer(cacheValue: CacheValue<unknown>) {
		if (cacheValue.options.staleTime && cacheValue.options.staleTime > 0) {
			if (!cacheValue.staleTimer && cacheValue.staleTimer !== 0) {
				cacheValue.staleTimer = setTimeout(() => {
					cacheValue.staleTimer = undefined;
					cacheValue.store.update((store) => {
						store.isStale = true;
						return store;
					});
				}, cacheValue.options.staleTime);
			}
		}
	}

	private getSerialized<T>(key: string): CacheValue<T> | undefined {
		return this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[key]);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private serializeKey(key: any[]): string {
		// if its an object sort keys by alphabetical
		return key.join('|');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private deserializeKey(key: string): any[] {
		return key.split('|');
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
	staleTimer?: number;
	isStaleSubscription?: Unsubscriber;
	options: QueryOptions<T>;
	store: Writable<StoreValue<T>>;
};

export type StoreValue<T> = {
	isError: boolean;
	isLoading: boolean;
	isStale: boolean;
	data: T | undefined;
};

export type QueryConfig = {
	staleTime: 1000;
};

// TODO: Store this in some sort of query client abstraction rather than this file
// may prevent it from being reloaded all the fucking time
const cache = new QueryCache();

export function createQuery<T>(
	key: string[],
	fn: QueryFn<T>,
	options?: QueryOptions<T>
): Writable<StoreValue<T>> {
	if (cache.has(key)) {
		console.log('CACHE ALREADY HAS KEY');
		cache.refreshIfStale(key);
		return cache.get<T>(key).store;
	}

	const value = cache.set(key, fn, options);
	return value.store;
}

export type MutatorArgs<T> = Array<T[keyof T]>;

export class Mutator<TStore, TArgs> {
	private workQueue: MutatorArgs<TArgs>[] = [];
	private working = false;

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

		this.startProcessing();
	}

	public mutate(...args: MutatorArgs<TArgs>) {
		this.workQueue.push(args);
	}

	private performMutation(...args: MutatorArgs<TArgs>) {
		this.working = true;
		this.isLoading = true;
		this.isError = false;

		try {
			if (DEBUG) console.log(`mutating v2 ${this.key}`);

			// NOTE: There is a racey kind of condition - almost want to keep an optimistic version of the data
			// If you quickly add to values to an array, the first gets optimistically added,
			// the second then gets optimistically added to the array before the first is actually added to the array
			// So before it gets hydrated from the data source you see the array missing the first value.
			//
			// Maybe we can keep the optimistic value stored in the mutator itself.. and modify that as required
			// Problem is for every mutation that occurs we need to keep a copy of the before, such that if an error
			// occurs we can roll it back then apply the following mutations over the top..
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
		} finally {
			this.working = false;
		}
	}

	private startProcessing() {
		// This ensures that the order of the mutations occuring is correct
		// TODO: Look at Web Workers, Event Listeners or Callbacks.. cause this sucks
		setInterval(() => {
			if (!this.working) {
				const work = this.workQueue.shift();
				if (work) {
					// Process the work item here
					this.performMutation(...work);
				}
			}
		}, 1);
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
