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

// FIXME: Would love to get rid of this any - unsure if it will be possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storeMap: Map<string, any> = new Map();

export type MapValue<T> = {
	function: () => Promise<T>;
	store: Writable<StoreValue<T>>;
};

export type StoreValue<T> = {
	isError: boolean;
	isLoading: boolean;
	data: T | undefined;
};

// TODO: Understand how a list of keys would work - in regards to hashing etc.
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
	if (DEBUG) console.log(`executing fn - try ${tryCount}`);
	if (tryCount < config.retryBackoffTime) {
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
				}, tryCount * config.retryBackoffTime);
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

export class Mutator<TStore, TArgs> {
	private key: string;
	private fn: (...args: Array<TArgs[keyof TArgs]>) => Promise<void>;
	private optimisticMutateFn?: (data: TStore, ...args: Array<TArgs[keyof TArgs]>) => TStore;

	private onSuccessFn?: (...args: Array<TArgs[keyof TArgs]>) => void;
	private onErrorFn?: (...args: Array<TArgs[keyof TArgs]>) => void;

	public isLoading = false;
	public isError = false;

	constructor(
		key: string,
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

		const mapValue = storeMap.get(this.key) as MapValue<TStore>;
		const currentValue = get(mapValue.store).data;
		const copiedValue = JSON.parse(JSON.stringify(currentValue));

		// NOTE: For me later, this happens for looading is triggered
		// because loading is only triggered once the refetch has started
		if (this.optimisticMutateFn && currentValue) {
			const updated = this.optimisticMutateFn(currentValue, ...args);
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

export function mutate<TStore, TArgs>(
	key: string,
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

function newMapValue<T>(fn: () => Promise<T>): MapValue<T> {
	return {
		function: fn,
		store: writable({
			isLoading: true,
			isError: false,
			data: undefined
		})
	};
}

function setMapValueValue<T>(mapValue: MapValue<T>, value: T) {
	mapValue.store.update((store) => {
		store.isLoading = false;
		store.isError = false;
		store.data = value;
		return store;
	});
	return mapValue;
}
