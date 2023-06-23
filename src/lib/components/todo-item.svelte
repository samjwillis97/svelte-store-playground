<script lang="ts">
	import { failure, success } from '$lib/my-toast';
	import type { TodoItem } from '$lib/service';
	import { deleteTodo } from '$lib/store';

	export let todo: TodoItem;

	let deleteMutator = deleteTodo({
		onSuccessFn: (item: string) => {
			success(`Cleared ${item} 🗑️`);
		},
		onErrorFn: () => {
			failure('Error occured deleting 😔');
		}
	});
</script>

{#if todo}
	<!-- TODO: if the element itself is still loading disable buttons (don't know how, like how to know whether it is real)-->
	<div
		class="w-96 border shadow rounded px-5 py-5 flex flex-row gap-2.5 justify-between items-center"
	>
		<div class="flex flex-row gap-2.5">
			<p class="text-xl">
				{todo.name}
			</p>
		</div>
		<div class="flex flex-row gap-2.5">
			<button
				disabled={true}
				class="py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700 disabled:bg-blue-200"
			>
				Info
			</button>
			<button
				on:click={() => $deleteMutator.mutate(todo.name)}
				class="py-2 px-4 rounded text-white bg-red-500 hover:bg-red-700 active:bg-red-800 disabled:bg-red-200"
			>
				Delete
			</button>
		</div>
	</div>
{/if}
