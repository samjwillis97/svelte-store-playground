import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
const dev = 'production' === 'development';
/** @type {import('@sveltejs/kit').Config}*/
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
		paths: {
			// change below to your repo name
			base: dev ? '' : '/svelte-store-playground'
		},
		alias: {
			$components: 'src/lib/components',
			'$components/*': 'src/lib/components/*'
		}
		// hydrate the <div id="svelte"> element in src/app.html
		// target: '#svelte'
	},
	preprocess: vitePreprocess(),
	shadcn: {
		componentPath: './src/lib/components/ui'
	}
};
export default config;
