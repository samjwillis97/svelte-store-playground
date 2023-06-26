import type { Writable } from 'svelte/store';
import { createQuery, mutate } from './query-client.js';
import { get, add, deleteItem, deleteAll, type TodoItem } from './service.js';
import type { StoreValue } from './my-store/queryCache.js';
import type { Mutator } from './my-store/mutator.js';

export function getTodos(): Writable<StoreValue<TodoItem[]>> {
	return createQuery<TodoItem[]>(['todos'], get, { staleTime: 10000 });
}

export function addTodo(options?: {
	onSuccessFn?: (name: string) => void;
	onErrorFn?: (name: string) => void;
}): Writable<Mutator<TodoItem[], { name: string }>> {
	return mutate<TodoItem[], { name: string }>(
		['todos'],
		async (name: string) => {
			await add(name);
		},
		{
			optimisticMutateFn: (data: TodoItem[], name: string) => {
				data.push({ name });
				return data;
			},
			...options
		}
	);
}

export function deleteTodo(options?: {
	onSuccessFn?: (name: string) => void;
	onErrorFn?: (name: string) => void;
}): Writable<Mutator<TodoItem[], { name: string }>> {
	return mutate<TodoItem[], { name: string }>(
		['todos'],
		async (name: string) => {
			await deleteItem(name);
		},
		{
			optimisticMutateFn: (data: TodoItem[], name: string) => {
				const index = data.findIndex((v) => v.name === name);
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
	onSuccessFn?: (name: string) => void;
	onErrorFn?: (name: string) => void;
}): Writable<Mutator<TodoItem[], never>> {
	return mutate<TodoItem[], never>(
		['todos'],
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
