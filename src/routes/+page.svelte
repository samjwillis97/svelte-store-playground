<script lang="ts">
	import { addTodo, clearAll, getTodos } from '../lib/store';
	import ServiceConfig from '$lib/components/service-config.svelte';
	import StoreConfig from '$lib/components/store-config.svelte';
	import TodoItem from '$lib/components/todo-item.svelte';
	import { failure, success } from '$lib/my-toast';
	import Button from '$components/ui/button/Button.svelte';
	import Input from '$components/ui/input/Input.svelte';
	import Label from '$components/ui/label/Label.svelte';

	let todos = getTodos();
	let clearAllMutator = clearAll({
		onSuccessFn: () => {
			success(`Cleared All 🗑️`);
		},
		onErrorFn: () => {
			failure(`Error occured clearing all 😔`);
		}
	});
	let addTodoMutator = addTodo({
		onSuccessFn: (name: string) => {
			success(`${name} Added 😊`);
		},
		onErrorFn: () => {
			failure(`Error ocurred adding 😔`);
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
		<Input
			placeholder="Todo"
			type="text"
			bind:value={todoText}
			on:keyup={handleInputKeyup}
			class="w-96"
		/>
		<Button disabled={$addTodoMutator.isLoading || !todoText} on:click={handleAddItem}
			>Add Item</Button
		>
		<Button variant="destructive" on:click={clearAllItems}>Clear All</Button>
		<div class="flex flex-row gap-1">
			<Label>Current Status:</Label>
			{#if $addTodoMutator.isLoading}
				<Label>Adder Loading,</Label>
			{/if}
			{#if $addTodoMutator.isError}
				<Label>Error Adding,</Label>
			{/if}
			{#if $todos.isLoading}
				<Label>Fetching Items,</Label>
			{:else if !$todos.isError}
				<Label>Waiting For Input...</Label>
			{/if}
			{#if $todos.isError}
				<Label>Error Occured Fetching - Retrying</Label>
			{/if}
		</div>
	</div>

	<!-- TODO: Handle overflow properly -->
	<div class="flex flex-col gap-2.5">
		{#if $todos.data && $todos.data.length > 0}
			{#each $todos.data as todo}
				<TodoItem {todo} />
			{/each}
		{/if}
	</div>
</div>
