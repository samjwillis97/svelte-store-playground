<script lang="ts">
	import { addTodo, clearAll, deleteTodo, getTodos } from '../lib/store';
	import {
		getConfig as getServiceConfig,
		updateConfig as updateServiceConfig
	} from '../lib/service';
	import { getConfig as getStoreConfig, updateConfig as updateStoreConfig } from '../lib/my-store';
	import { to_number } from 'svelte/internal';

	// config
	let serviceConfig = getServiceConfig();
	let serviceFailureRate = serviceConfig.failureRate;
	let serviceSleepTime = serviceConfig.sleepTime;

	let storeConfig = getStoreConfig();
	let storeRetryCount = storeConfig.retryCount;
	let storeRetryBackoff = storeConfig.retryBackoffTime;

	function handleServiceConfigInputUpdate() {
		serviceConfig.failureRate = to_number(serviceFailureRate);
		serviceConfig.sleepTime = to_number(serviceSleepTime);
		updateServiceConfig(serviceConfig);
	}

	function handleStoreConfigInputUpdate() {
		storeConfig.retryCount = to_number(storeRetryCount);
		storeConfig.retryBackoffTime = to_number(storeRetryBackoff);
		updateStoreConfig(storeConfig);
	}

	let todos = getTodos();
	let addTodoMutator = addTodo();

	let todoText = '';

	function handleAddItem() {
		if (!todoText) return;
		$addTodoMutator.mutate(todoText);
		todoText = '';
	}

	function handleInputKeyup(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleAddItem();
		}
	}

	// addTodoMutator.subscribe((v) => console.log(v));

	// To communicate mutation error back up to this layer,
	// need to make the mutation a class, with that mutate method
	// on it, such that you have a store to indicate whether an error
	// ocurred - starting to understand Tanstack Query a bit more
</script>

<div class="flex flex-col gap-5 p-10 items-center">
	<div class="flex flex-row gap-5 w-full">
		<div class="flex flex-col w-full gap-2.5">
			<h3 class="text-xl">Service Configuration</h3>
			<div class="w-full">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceFailureRate">
					Failure Rate
				</label>
				<input
					id="serviceFailureRate"
					placeholder="Failure Rate"
					type="number"
					bind:value={serviceFailureRate}
					on:change={handleServiceConfigInputUpdate}
					class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
				/>
			</div>
			<div class="w-full">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceSleepTime">
					Sleep Time (ms)
				</label>
				<input
					id="serviceSleepTime"
					placeholder="Sleep Time"
					type="number"
					bind:value={serviceSleepTime}
					on:change={handleServiceConfigInputUpdate}
					class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
				/>
			</div>
		</div>
		<div class="flex flex-col w-full gap-2.5">
			<h3 class="text-xl">Store Configuration</h3>
			<div class="w-full">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="storeRetryCount">
					Retry Count
				</label>
				<input
					id="storeRetryCount"
					placeholder="Retry Count"
					type="number"
					bind:value={storeRetryCount}
					on:change={handleStoreConfigInputUpdate}
					class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
				/>
			</div>
			<div class="w-full">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceSleepTime">
					Retry Back Off (ms)
				</label>
				<input
					id="storeRetryBackoff"
					placeholder="Back Off (ms)"
					type="number"
					bind:value={storeRetryBackoff}
					on:change={handleStoreConfigInputUpdate}
					class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
				/>
			</div>
		</div>
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
			on:click={clearAll}
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
				<div
					class="w-96 border shadow rounded px-5 py-5 flex flex-row gap-2.5 justify-between items-center"
				>
					<div class="flex flex-row gap-2.5">
						<p class="text-xl">
							{todo}
						</p>
					</div>
					<div class="flex flex-row gap-2.5">
						<button
							disabled={true}
							class="py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700 disabled:bg-blue-200"
						>
							info
						</button>
						<button
							on:click={() => deleteTodo(todo)}
							class="py-2 px-4 rounded text-white bg-red-500 hover:bg-red-700 active:bg-red-800 disabled:bg-red-200"
						>
							delete
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- TODO: This disable would work better if it was on the mutation for the event -->
