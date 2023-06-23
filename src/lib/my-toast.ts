import { toast } from '@zerodevx/svelte-toast';

export const success = (m: string) =>
	toast.push(m, {
		duration: 2000,
		classes: ['success']
	});

export const warning = (m: string) => toast.push(m, { classes: ['warning'] });

export const failure = (m: string) => toast.push(m, { classes: ['failure'] });
