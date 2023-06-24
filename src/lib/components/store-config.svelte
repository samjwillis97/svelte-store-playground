<script lang="ts">
	import { getConfig, updateConfig } from '$lib/my-store';
	import { to_number } from 'svelte/internal';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	let storeConfig = getConfig();
	let storeRetryCount = storeConfig.retryCount;
	let storeRetryBackoff = storeConfig.retryBackoffTime;

	function handleStoreConfigInputUpdate() {
		storeConfig.retryCount = to_number(storeRetryCount);
		storeConfig.retryBackoffTime = to_number(storeRetryBackoff);
		updateConfig(storeConfig);
	}
</script>

<div class="flex flex-col w-full gap-2.5">
	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Store Configuration</h3>
	<div class="w-full">
		<Label for="storeRetryCount">Retry Count</Label>
		<Input
			id="storeRetryCount"
			placeholder="Retry Count"
			type="number"
			bind:value={storeRetryCount}
			on:change={handleStoreConfigInputUpdate}
		/>
	</div>
	<div class="w-full">
		<Label for="serviceSleepTime">Retry Back Off (ms)</Label>
		<Input
			id="storeRetryBackoff"
			placeholder="Back Off (ms)"
			type="number"
			bind:value={storeRetryBackoff}
			on:change={handleStoreConfigInputUpdate}
		/>
	</div>
</div>
