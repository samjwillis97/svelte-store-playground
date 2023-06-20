import { get, writable, type Writable } from 'svelte/store';

// config
const retries = 5;
const backoff = 500;
const DEBUG = true;

let config: StoreConfig = {
	retryCount: 5,
	retryBackoffTime: 100
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

// Would love to get rid of this any
const storeMap: Map<string, any> = new Map();

// TODO: Understand how a list of keys would work - in regards to hashing etc.

export type MapValue<T> = {
	function: () => Promise<T>;
	// data: T | undefined; // This could be replaced with get()
	store: Writable<StoreValue<T>>;
};

export type StoreValue<T> = {
	isError: boolean;
	isLoading: boolean;
	data: T | undefined;
};

// fn has to be async - which is cool by me
export function createQuery<T>(key: string, fn: () => Promise<T>): Writable<StoreValue<T>> {
	const storeValue = storeMap.get(key);
	if (storeValue) {
		refresh(key);
		return storeValue.store as Writable<StoreValue<T>>;
	}

	if (DEBUG) console.log(`creating: ${key}`);
	const mapValue = newMapValue(fn);

	storeMap.set(key, mapValue);

	tryFunction(mapValue, fn);

	return storeMap.get(key).store as Writable<StoreValue<T>>;
}

function tryFunction<T>(mapValue: MapValue<T>, fn: () => Promise<T>, tryCount = 0) {
	if (DEBUG) console.log('executing fn');
	if (tryCount < retries) {
		fn()
			.then((v) => setMapValueValue(mapValue, v))
			.catch(() => {
				mapValue.store.update((v) => {
					v.isError = true;
					return v;
				});
				tryCount = tryCount + 1;
				if (DEBUG) console.log(`retry: ${tryCount}`);
				setTimeout(() => {
					tryFunction<T>(mapValue, fn, tryCount);
				}, tryCount * backoff);
			});
	}
}

export function refresh<T>(key: string) {
	if (DEBUG) console.log(`refreshing: ${key}`);
	if (!storeMap.has(key)) return;

	const mapValue = storeMap.get(key) as MapValue<T>;
	mapValue.store.update((v) => {
		v.isLoading = true;
		return v;
	});

	tryFunction(mapValue, mapValue.function);
}

export class Mutator<T> {
	private key: string;
	private fn: (...args: unknown[]) => Promise<unknown>;
	private optimisticMutateFn?: (data: T, ...args: unknown[]) => T;

	public isLoading = false;
	public isError = false;

	constructor(
		key: string,
		fn: () => Promise<unknown>,
		optimisticMutateFn?: ((data: T) => T) | undefined
	) {
		this.key = key;
		this.fn = fn;
		this.optimisticMutateFn = optimisticMutateFn;
	}

	// TODO: Would be cool to get the type of the provided fn
	public mutate(...args: unknown[]) {
		console.log(args);
		this.isLoading = true;
		this.isError = false;

		if (DEBUG) console.log(`mutating v2 ${this.key}`);

		const mapValue = storeMap.get(this.key) as MapValue<T>;
		const currentValue = get(mapValue.store).data;
		const copiedValue = JSON.parse(JSON.stringify(currentValue));

		// NOTE: For me later, this happens for looading is triggered
		// because loading is only triggered once the refetch has started
		if (this.optimisticMutateFn && currentValue) {
			const updated = this.optimisticMutateFn(currentValue, args);
			mapValue.store.update((store) => {
				store.data = updated;
				return store;
			});
		}

		this.fn(...args)
			.then(() => {
				if (mapValue) {
					refresh(this.key);
				}
				this.isLoading = false;
			})
			.catch(() => {
				this.isError = true;
				this.isLoading = false;
				if (DEBUG) console.log(`error mutating: ${this.key}`);
				if (this.optimisticMutateFn) {
					// mapValue.data = copiedValue;
					mapValue.store.update((store) => {
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

export function mutate<T>(
	key: string,
	fn: (...args: unknown[]) => Promise<unknown>, // the return is not used
	optimisticMutateFn?: (data: T) => T
): Writable<Mutator<T>> {
	const mutator = new Mutator(key, fn, optimisticMutateFn);
	return writable(mutator);
}

function newMapValue<T>(fn: () => Promise<T>): MapValue<T> {
	return {
		function: fn,
		// data: undefined,
		store: writable({
			isLoading: true,
			isError: false,
			data: undefined
		})
	};
}

function setMapValueValue<T>(mapValue: MapValue<T>, value: T) {
	// mapValue.data = value;
	mapValue.store.update((store) => {
		store.isLoading = false;
		store.isError = false;
		store.data = value;
		return store;
	});
	return mapValue;
}
