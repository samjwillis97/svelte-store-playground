import type { Writable } from 'svelte/store';
import { Mutator, createQuery, mutate } from './my-store.js';
import { get, add, deleteItem, deleteAll } from './service.js';

// const DEBUG = false;

export function getTodos() {
	return createQuery('todos', get);
}

export function addTodo(): Writable<Mutator<string[], { item: string }>> {
	return mutate<string[], { item: string }>('todos', add, (data: string[], item: string) => {
		data.push(item);
		return data;
	});
}

export function deleteTodo(name: string) {
	mutate('todos', async () => await deleteItem(name));
}

export function clearAll() {
	mutate('todos', deleteAll);
}
