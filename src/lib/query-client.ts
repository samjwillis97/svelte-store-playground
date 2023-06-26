import type { Writable } from 'svelte/store';
import type { Mutator, MutatorArgs } from './my-store/mutator';
import type { QueryFn, QueryOptions, StoreValue } from './my-store/queryCache';
import { QueryClient } from './my-store/queryClient';

const client = new QueryClient();

export function createQuery<T>(
	key: string[],
	fn: QueryFn<T>,
	options?: QueryOptions<T>
): Writable<StoreValue<T>> {
	return client.createQuery(key, fn, options);
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
	return client.createMutation<TStore, TArgs>(key, fn, options);
}
