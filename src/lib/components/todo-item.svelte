<script lang="ts">
	import { failure, success } from '$lib/my-toast';
	import type { TodoItem } from '$lib/service';
	import { deleteTodo } from '$lib/store';
	import { Trash2 } from 'lucide-svelte';
	import { Label } from './ui/label';
	import { Button } from './ui/button';
	import { Card } from './ui/card';
	import TodoPopup from './todo-popup.svelte';

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
	<Card class="w-96 flex flex-row gap-2.5 justify-between items-center px-5 py-5">
		<div class="flex flex-row gap-2.5">
			<Label>
				{todo.name}
			</Label>
		</div>
		<div class="flex flex-row gap-2.5">
			<TodoPopup {todo} />
			<Button variant="destructive" on:click={() => $deleteMutator.mutate(todo.name)}>
				<Trash2 size="18" />
			</Button>
		</div>
	</Card>
{/if}
