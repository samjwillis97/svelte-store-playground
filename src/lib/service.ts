import { sleep } from './utils.js';

let todos: string[] = [];
const failureRate = 0.5;
const sleepTime = 0.25;
const DEBUG = true;

export async function get() {
	await sleep(sleepTime);
	if (shouldError()) throw new Error('unable to get');
	if (DEBUG) console.log('service: get');
	// NOTE: Stringify used to prevent sending back the same ref
	if (DEBUG) console.log(todos);
	return JSON.parse(JSON.stringify(todos));
}

export async function add() {
	await sleep(sleepTime);
	if (shouldError()) throw new Error('unable to add');
	todos.push(todos.length.toString());
	if (DEBUG) console.log('service: add');
	if (DEBUG) console.log(todos);
	return true;
}

export async function deleteAll() {
	await sleep(sleepTime);
	if (shouldError()) throw new Error('unable to deleteAll');
	todos = [];
	if (DEBUG) console.log('service: deleteAll');
	if (DEBUG) console.log(todos);
	return true;
}

export async function deleteItem(key: string) {
	await sleep(sleepTime);
	if (shouldError()) throw new Error('unable to deleteItem');
	const index = todos.findIndex((v) => v === key);
	if (index !== -1) {
		todos.splice(index, 1);
	}
	if (DEBUG) console.log('service: deleteOne');
	if (DEBUG) console.log(todos);
	return true;
}

function shouldError() {
	return Math.random() < failureRate;
}
