import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export async function sleep(seconds: number) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
