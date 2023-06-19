<script lang="ts">
	import { addTodo, addTodoV2, clearAll, deleteTodo, getTodos } from '../lib/store';

	let todos = getTodos();
	let addTodoMutator = addTodoV2();

	function handleAddItem() {
		console.log('adding');
		addTodo();
	}

	function handleAddItemV2() {
		$addTodoMutator.mutate();
	}

	addTodoMutator.subscribe((v) => console.log(v));

	// To communicate mutation error back up to this layer,
	// need to make the mutation a class, with that mutate method
	// on it, such that you have a store to indicate whether an error
	// ocurred - starting to understand Tanstack Query a bit more
</script>

<!-- TODO: This disable would work better if it was on the mutation for the event -->
<button disabled={$todos.isLoading} on:click={handleAddItem}>Add Item</button>
<button disabled={$addTodoMutator.isLoading} on:click={handleAddItemV2}>Add Item 2</button>
<button on:click={clearAll}>Clear All</button>

<div>
	{#if $addTodoMutator.isError}
		<p>Adder Loading</p>
	{/if}
	{#if $addTodoMutator.isError}
		<p>Error Adding</p>
	{/if}
	{#if $todos.isLoading}
		<p>Loading</p>
	{:else}
		<p>Finished</p>
	{/if}
	{#if $todos.isError}
		<p>Error Loading</p>
	{/if}
</div>

<div>
	{#if $todos.data && $todos.data.length > 0}
		<ul>
			{#each $todos.data as todo}
				<div>
					<li>{todo}</li>
					<button> info </button>
					<button on:click={() => deleteTodo(todo)}> delete </button>
				</div>
			{/each}
		</ul>
	{/if}
</div>
