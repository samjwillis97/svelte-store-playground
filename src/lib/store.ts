import type { Writable } from 'svelte/store';
import { Mutator, createQuery, mutate, type StoreValue } from './my-store.js';
import { get, add, deleteItem, deleteAll } from './service.js';

export function getTodos(): Writable<StoreValue<string[]>> {
	return createQuery<string[]>('todos', get);
}

export function addTodo(options?: {
	onSuccessFn?: (item: string) => void;
	onErrorFn?: (item: string) => void;
}): Writable<Mutator<string[], { item: string }>> {
	return mutate<string[], { item: string }>(
		'todos',
		async (name: string) => {
			await add(name);
		},
		{
			optimisticMutateFn: (data: string[], item: string) => {
				data.push(item);
				return data;
			},
			...options
		}
	);
}

export function deleteTodo(options?: {
	onSuccessFn?: (item: string) => void;
	onErrorFn?: (item: string) => void;
}): Writable<Mutator<string[], { item: string }>> {
	return mutate<string[], { item: string }>(
		'todos',
		async (name: string) => {
			await deleteItem(name);
		},
		{
			optimisticMutateFn: (data: string[], item: string) => {
				const index = data.findIndex((v) => v === item);
				if (index !== -1) {
					data.splice(index, 1);
				}
				return data;
			},
			...options
		}
	);
}

export function clearAll(options?: {
	onSuccessFn?: (item: string) => void;
	onErrorFn?: (item: string) => void;
}): Writable<Mutator<string[], never>> {
	return mutate<string[], never>(
		'todos',
		async () => {
			await deleteAll();
		},
		{
			optimisticMutateFn: () => {
				return [];
			},
			...options
		}
	);
}
