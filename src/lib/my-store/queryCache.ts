import { writable, type Unsubscriber, type Writable } from 'svelte/store';

export type QueryFn<T> = () => Promise<T>;
export type QueryOptions<T> = {
	staleTime?: number;
};

export class CacheValue<T> {
	private staleTimer?: number;
	isStaleSubscription?: Unsubscriber;

	function: QueryFn<T>;
	options: QueryOptions<T>;
	store: Writable<StoreValue<T>>;

	constructor(fn: QueryFn<T>, options?: QueryOptions<T>) {
		this.function = fn;
		this.options = options ?? {};
		this.store = writable({
			isLoading: true,
			isError: false,
			isStale: false,
			data: undefined
		});
	}

	setValue(value: T): this {
		this.store.update((store) => {
			store.isLoading = false;
			store.isError = false;
			store.isStale = false;
			store.data = value;
			return store;
		});

		clearTimeout(this.staleTimer);
		this.staleTimer = undefined;

		this.startStaleTimer();

		return this;
	}

	invalidate(): this {
		this.store.update((value) => {
			value.isStale = true;
			return value;
		});

		// TODO: tryFunction was here previously
		// Well because we only start the timer if the option is set,
		// we can probably rely on the subscription to isStale to
		// fire the tryFunction

		return this;
	}

	// This would be better as events of callbacks or something, checkout the notify manager on tanstack
	// TODO: Probably shouldn't auto-fetch data if tab is in background etc. Not sure how to handle that
	private startStaleTimer() {
		if (this.options.staleTime && this.options.staleTime > 0) {
			if (!this.staleTimer && this.staleTimer !== 0) {
				this.staleTimer = setTimeout(() => {
					this.staleTimer = undefined;
					this.store.update((store) => {
						store.isStale = true;
						return store;
					});
				}, this.options.staleTime);
			}
		}
	}
}

export type StoreValue<T> = {
	isError: boolean;
	isLoading: boolean;
	isStale: boolean;
	data: T | undefined;
};

// FIXME: this still fucking gets recreated every hot reload
export class QueryCache {
	private cache: { [key: string]: CacheValue<unknown> } = {};

	// get, returns the value in the cache or throws an error if
	// it doesn't exist
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get<T>(key: any[]): CacheValue<T> {
		const serialized = this.serializeKey(key);
		const value = this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[serialized]);
		if (!value) throw new Error('Key not found');
		return value;
	}

	// set, will create a new Cache value and store it in the cache
	// if one exists it will return the existing.
	// NOTE: Not sure whether it should do the following or not..
	// with the key, it will also start a subsciption to refresh if stale.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set<T>(key: any[], value: CacheValue<T>): CacheValue<T> {
		const serialized = this.serializeKey(key);

		const existing = this.coerceAndCheckUnknown<CacheValue<T>>(this.cache[serialized]);
		if (existing) return existing;

		this.cache[serialized] = value;
		return value;
	}

	// has, checks whether the key exists in the cache or not
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	has(key: any[]): boolean {
		const serialized = this.serializeKey(key);
		if (this.coerceAndCheckUnknown(this.cache[serialized])) {
			return true;
		}
		return false;
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
