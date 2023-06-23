<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';

	const options = {
		duration: 4000, // duration of progress bar tween to the `next` value
		initial: 1, // initial progress bar value
		next: 0, // next progress value
		pausable: false, // pause progress bar tween on mouse hover
		dismissable: true, // allow dismiss with close button
		reversed: false, // insert new toast to bottom of stack
		intro: { x: 256 }, // toast intro fly animation settings
		theme: {}, // css var overrides
		classes: [] // user-defined classes
	};
</script>

<div class="wrap">
	<SvelteToast {options} />
</div>

<style lang="postcss">
	.wrap :global(._toastMsg) {
		@apply ml-2 text-sm;
		/* width: unset; */
	}

	.wrap :global(._toastItem) {
		/* Border isn't working properly */
		@apply rounded-md drop-shadow-lg opacity-80;
		min-height: unset;
	}

	/* TODO: Icon on the left */
	/* TODO: Dark Border */
	.wrap :global(.success ._toastItem) {
		@apply bg-green-300;
	}

	.wrap :global(.success ._toastMsg) {
		@apply text-neutral-800;
	}
	.wrap :global(.success ._toastBtn) {
		@apply text-neutral-800;
	}

	.wrap :global(.warning ._toastItem) {
		@apply bg-amber-400;
	}

	.wrap :global(.failure ._toastItem) {
		@apply bg-red-600;
	}

	.wrap :global(._toastBar) {
		height: 0px;
	}
</style>
