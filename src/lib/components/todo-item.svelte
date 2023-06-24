<script lang="ts">
	import { failure, success } from '$lib/my-toast';
	import type { TodoItem } from '$lib/service';
	import { deleteTodo } from '$lib/store';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from './ui/dialog';
	import { Label } from './ui/label';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';

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
			<Dialog modal={true}>
				<DialogTrigger class={buttonVariants({ variant: 'outline' })}>Edit Profile</DialogTrigger>
				<DialogContent class="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label class="text-right">Name</Label>
							<Input id="name" value="Pedro Duarte" class="col-span-3" />
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label class="text-right">Username</Label>
							<Input id="username" value="@peduarte" class="col-span-3" />
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	</div>
{/if}
