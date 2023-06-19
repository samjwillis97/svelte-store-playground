import type { Writable } from 'svelte/store';
import { Mutator, createQuery, mutate, mutateV2 } from './my-store.js';
import { get, add, deleteItem, deleteAll } from './service.js';

// const DEBUG = false;

export function getTodos() {
	return createQuery('todos', get);
}

export function addTodoV2(): Writable<Mutator<string[]>> {
	return mutateV2<string[]>('todos', add, (data) => {
		if (data) {
			data.push(data?.length.toString());
			return data;
		}
	});
}

export function addTodo() {
	mutate<string[]>('todos', add, (data) => {
		if (data) {
			data.push(data?.length.toString());
			return data;
		}
	});
}

export function deleteTodo(name: string) {
	mutate('todos', async () => await deleteItem(name));
}

export function clearAll() {
	mutate('todos', deleteAll);
}
