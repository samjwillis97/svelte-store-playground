<script lang="ts">
	import { getConfig, updateConfig } from '$lib/my-store';
	import { to_number } from 'svelte/internal';

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
	<h3 class="text-xl">Store Configuration</h3>
	<div class="w-full">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="storeRetryCount">
			Retry Count
		</label>
		<input
			id="storeRetryCount"
			placeholder="Retry Count"
			type="number"
			bind:value={storeRetryCount}
			on:change={handleStoreConfigInputUpdate}
			class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
		/>
	</div>
	<div class="w-full">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceSleepTime">
			Retry Back Off (ms)
		</label>
		<input
			id="storeRetryBackoff"
			placeholder="Back Off (ms)"
			type="number"
			bind:value={storeRetryBackoff}
			on:change={handleStoreConfigInputUpdate}
			class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
		/>
	</div>
</div>
