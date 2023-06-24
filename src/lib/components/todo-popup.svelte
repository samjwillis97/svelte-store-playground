<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from './ui/dialog';
	import { Dialog as DialogPrimitive } from 'radix-svelte';
	import { Button, buttonVariants } from './ui/button';
	import type { TodoItem } from '$lib/service';
	import { Textarea } from './ui/textarea';

	export let todo: TodoItem;

	function saveChanges() {
		console.log(todo.description);
	}
</script>

<Dialog modal={true}>
	<DialogTrigger class={buttonVariants({ variant: 'default' })}>Open</DialogTrigger>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>{todo.name}</DialogTitle>
			<DialogDescription>
				Make changes to the item here. Click save when you're done.
			</DialogDescription>
		</DialogHeader>
		<Textarea placeholder="Insert summary here..." bind:value={todo.description} />
		<DialogFooter>
			<DialogPrimitive.Close>
				<Button on:click={saveChanges}>Save changes</Button>
			</DialogPrimitive.Close>
		</DialogFooter>
	</DialogContent>
</Dialog>
