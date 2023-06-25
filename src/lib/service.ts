import { sleep } from './utils.js';

let todos: TodoItem[] = [];

export type TodoItem = {
	name: string;
	description?: string;
};

export type UpdateTodoItem = {
	name?: string;
	description?: string;
};

export const DEBUG = true;
let config: ServiceConfig = {
	failureRate: 0.05,
	sleepTime: 0.25
};

export type ServiceConfig = {
	failureRate: number;
	sleepTime: number;
};

export function getConfig(): ServiceConfig {
	return config;
}

export function updateConfig(updated: ServiceConfig) {
	config = updated;
}

export async function get() {
	await sleep(config.sleepTime);
	if (shouldError()) throw new Error('unable to get');
	if (DEBUG) console.log('service: get');
	// NOTE: Stringify used to prevent sending back the same ref
	return JSON.parse(JSON.stringify(todos));
}

export async function add(name: string) {
	await sleep(config.sleepTime);
	if (shouldError()) throw new Error('unable to add');
	todos.push({ name });
	if (DEBUG) console.log('service: add');
	return true;
}

export async function update(name: string, update: UpdateTodoItem) {
	await sleep(config.sleepTime);
	if (shouldError()) throw new Error('unable to update');
	if (DEBUG) console.log('service: update');

	const index = todos.findIndex((v) => v.name === name);
	if (index !== -1) {
		todos[index] = { ...todos[index], ...update };
	}

	return true;
}

export async function deleteAll() {
	await sleep(config.sleepTime);
	if (shouldError()) throw new Error('unable to deleteAll');
	todos = [];
	if (DEBUG) console.log('service: deleteAll');
	return true;
}

export async function deleteItem(name: string) {
	await sleep(config.sleepTime);
	if (shouldError()) throw new Error('unable to deleteItem');
	const index = todos.findIndex((v) => v.name === name);
	if (index !== -1) {
		todos.splice(index, 1);
	}
	if (DEBUG) console.log('service: deleteOne');
	return true;
}

function shouldError() {
	return Math.random() < config.failureRate;
}
