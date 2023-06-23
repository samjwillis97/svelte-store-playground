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
	.wrap {
		display: contents;
		font-family: Roboto, sans-serif;
		font-size: 0.875rem;
		/* You can set CSS vars here too */
	}
	.wrap :global(strong) {
		font-weight: 600;
	}

	.wrap :global(._toastMsg) {
		@apply ml-2;
	}

	.wrap :global(._toastItem) {
		/* Border isn't working properly */
		@apply rounded border-2 border-black drop-shadow-lg opacity-95;
	}

	.wrap :global(.success ._toastItem) {
		@apply bg-green-500;
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
