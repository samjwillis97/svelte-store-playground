import { get } from 'svelte/store';
import type { QueryCache } from './queryCache';

export type MutatorArgs<T> = Array<T[keyof T]>;

export class Mutator<TStore, TArgs> {
	private queryCache: QueryCache;
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
		queryCache: QueryCache,
		key: string[],
		fn: (...args: MutatorArgs<TArgs>) => Promise<void>,
		options?: {
			optimisticMutateFn?: (data: TStore, ...args: MutatorArgs<TArgs>) => TStore;
			onSuccessFn?: (...args: MutatorArgs<TArgs>) => void;
			onErrorFn?: (...args: MutatorArgs<TArgs>) => void;
		}
	) {
		this.queryCache = queryCache;
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
			// NOTE: There is a racey kind of condition - almost want to keep an optimistic version of the data
			// If you quickly add to values to an array, the first gets optimistically added,
			// the second then gets optimistically added to the array before the first is actually added to the array
			// So before it gets hydrated from the data source you see the array missing the first value.
			//
			// Maybe we can keep the optimistic value stored in the mutator itself.. and modify that as required
			// Problem is for every mutation that occurs we need to keep a copy of the before, such that if an error
			// occurs we can roll it back then apply the following mutations over the top..
			const cacheValue = this.queryCache.get<TStore>(this.key);
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
					cacheValue.invalidate();

					if (this.onSuccessFn) {
						this.onSuccessFn(...args);
					}
				})
				.catch(() => {
					this.isError = true;
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
