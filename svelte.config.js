import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

const dev = 'production' === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'docs',
			assets: 'docs'
		}),
		paths: {
			// change below to your repo name
			base: dev ? '' : '/svelte-store-playground'
		}
		// hydrate the <div id="svelte"> element in src/app.html
		// target: '#svelte'
	},
	preprocess: vitePreprocess()
};

export default config;
