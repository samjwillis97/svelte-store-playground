import { get, writable, type Writable } from 'svelte/store';
import {
	CacheValue,
	QueryCache,
	type QueryFn,
	type QueryOptions,
	type StoreValue
} from './queryCache';
import { Mutator, type MutatorArgs } from './mutator';

export type QueryClientOptions = {
	retryCount?: number;
	retryBackoffTime?: number;
};

export class QueryClient {
	private queryCache: QueryCache;
	private queryClientOptions: QueryClientOptions = {};

	constructor(options?: QueryClientOptions) {
		this.queryCache = new QueryCache();
		this.queryClientOptions = { ...this.queryClientOptions, ...options };
	}

	setOptions(options: QueryClientOptions) {
		this.queryClientOptions = { ...this.queryClientOptions, ...options };
	}

	createQuery<T>(
		key: string[],
		fn: QueryFn<T>,
		options?: QueryOptions<T>
	): Writable<StoreValue<T>> {
		if (this.queryCache.has(key)) {
			this.refreshIfStale(key);
			return this.queryCache.get<T>(key).store;
		}

		const value = new CacheValue(fn, options);

		value.isStaleSubscription = value.store.subscribe((v) => {
			if (v.isStale && !v.isLoading) {
				value.store.update((value) => {
					value.isLoading = true;
					return value;
				});
				this.tryFunction(value);
			}
		});

		this.queryCache.set(key, value);
		this.tryFunction(value);

		return value.store;
	}

	// refreshIfStale, first checks if the data is stale before
	// refreshing it, otherwise does nothing.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	refreshIfStale(key: any[]) {
		try {
			if (get(this.queryCache.get(key).store).isStale) {
				this.refresh(key);
			}
		} catch {
			console.warn('Unable to refresh store');
		}
	}

	createMutation<TStore, TArgs>(
		key: string[],
		fn: (...args: MutatorArgs<TArgs>) => Promise<void>,
		options?: {
			optimisticMutateFn?: (data: TStore, ...args: MutatorArgs<TArgs>) => TStore;
			onSuccessFn?: (...args: MutatorArgs<TArgs>) => void;
			onErrorFn?: (...args: MutatorArgs<TArgs>) => void;
		}
	): Writable<Mutator<TStore, TArgs>> {
		const mutator = new Mutator(this.queryCache, key, fn, options);
		return writable(mutator);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private refresh(key: any[]) {
		try {
			const cacheValue = this.queryCache.get(key);
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
		if (tryCount < (this.queryClientOptions?.retryCount ?? 1)) {
			cacheValue
				.function()
				.then((v) => {
					cacheValue.setValue(v);
				})
				.catch(() => {
					cacheValue.store.update((v) => {
						v.isError = true;
						return v;
					});

					tryCount = tryCount + 1;

					if (
						this.queryClientOptions.retryBackoffTime &&
						this.queryClientOptions.retryBackoffTime > 0
					) {
						setTimeout(() => {
							this.tryFunction(cacheValue, tryCount);
						}, tryCount * this.queryClientOptions?.retryBackoffTime);
					}
				});
		}
	}
}
