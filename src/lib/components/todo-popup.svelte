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
	import { Label } from './ui/label';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import type { TodoItem } from '$lib/service';
	import { Textarea } from './ui/textarea';

	export let todo: TodoItem;
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
		<Textarea placeholder="Insert summary here..." />
		<DialogFooter>
			<Button type="submit">Save changes</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
