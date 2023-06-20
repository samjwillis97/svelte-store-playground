import type { Writable } from 'svelte/store';
import { Mutator, createQuery, mutate, type StoreValue } from './my-store.js';
import { get, add, deleteItem, deleteAll } from './service.js';

export function getTodos(): Writable<StoreValue<string[]>> {
	return createQuery<string[]>('todos', get);
}

export function addTodo(): Writable<Mutator<string[], { item: string }>> {
	return mutate<string[], { item: string }>('todos', add, (data: string[], item: string) => {
		data.push(item);
		return data;
	});
}

export function deleteTodo(): Writable<Mutator<string[], { item: string }>> {
	return mutate<string[], { item: string }>('todos', deleteItem);
}

export function clearAll(): Writable<Mutator<string[], never>> {
	return mutate<string[], never>('todos', deleteAll);
}
