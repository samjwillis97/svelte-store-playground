<script lang="ts">
	import { addTodo, clearAll, getTodos } from '../lib/store';
	import ServiceConfig from '$lib/components/service-config.svelte';
	import StoreConfig from '$lib/components/store-config.svelte';
	import TodoItem from '$lib/components/todo-item.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	let todos = getTodos();
	let clearAllMutator = clearAll({
		onSuccessFn: () => {
			toast.push(`Cleared All 🗑️`);
		},
		onErrorFn: () => {
			toast.push(`Error occured clearing all 😔`);
		}
	});
	let addTodoMutator = addTodo({
		onSuccessFn: (name: string) => {
			toast.push(`${name} Added 😊`);
		},
		onErrorFn: () => {
			toast.push(`Error ocurred adding 😔`);
		}
	});

	let todoText = '';
	function handleAddItem() {
		if (!todoText || $addTodoMutator.isLoading) return;

		$addTodoMutator.mutate(todoText);

		todoText = '';
	}

	function clearAllItems() {
		$clearAllMutator.mutate();
	}

	function handleInputKeyup(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleAddItem();
		}
	}
</script>

<div class="flex flex-col gap-5 p-10 items-center">
	<div class="flex flex-row gap-5 w-full">
		<ServiceConfig />
		<StoreConfig />
	</div>

	<div class="flex flex-row gap-2.5 items-center w-full">
		<input
			placeholder="Item"
			type="text"
			bind:value={todoText}
			on:keyup={handleInputKeyup}
			class="shadow appearance-none border rounded px-3 py-2 text-gray"
		/>
		<button
			disabled={$addTodoMutator.isLoading || !todoText}
			on:click={handleAddItem}
			class="py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-200"
			>Add Item</button
		>
		<button
			on:click={clearAllItems}
			class="py-2 px-4 rounded text-white bg-red-500 hover:bg-red-700 active:bg-red-800 disable:bg-red-200"
			>Clear All</button
		>
		<div class="flex flex-row gap-1">
			<p>Current Status:</p>
			{#if $addTodoMutator.isLoading}
				<p>Adder Loading,</p>
			{/if}
			{#if $addTodoMutator.isError}
				<p>Error Adding,</p>
			{/if}
			{#if $todos.isLoading}
				<p>Fetching Items,</p>
			{:else if !$todos.isError}
				<p>Waiting For Input...</p>
			{/if}
			{#if $todos.isError}
				<p>Error Occured Fetching - Retrying</p>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-2.5">
		{#if $todos.data && $todos.data.length > 0}
			{#each $todos.data as todo}
				<TodoItem {todo} />
			{/each}
		{/if}
	</div>
</div>
