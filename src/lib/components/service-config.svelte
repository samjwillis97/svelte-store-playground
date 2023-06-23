<script lang="ts">
	import { getConfig, updateConfig } from '$lib/service';
	import { to_number } from 'svelte/internal';

	let serviceConfig = getConfig();
	let serviceFailureRate = serviceConfig.failureRate;
	let serviceSleepTime = serviceConfig.sleepTime;

	function handleServiceConfigInputUpdate() {
		serviceConfig.failureRate = to_number(serviceFailureRate);
		serviceConfig.sleepTime = to_number(serviceSleepTime);
		updateConfig(serviceConfig);
	}
</script>

<div class="flex flex-col w-full gap-2.5">
	<h3 class="text-xl">Service Configuration</h3>
	<div class="w-full">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceFailureRate">
			Failure Rate
		</label>
		<input
			id="serviceFailureRate"
			placeholder="Failure Rate"
			type="number"
			bind:value={serviceFailureRate}
			on:change={handleServiceConfigInputUpdate}
			class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
		/>
	</div>
	<div class="w-full">
		<label class="block text-gray-700 text-sm font-bold mb-2" for="serviceSleepTime">
			Sleep Time (s)
		</label>
		<input
			id="serviceSleepTime"
			placeholder="Sleep Time"
			type="number"
			bind:value={serviceSleepTime}
			on:change={handleServiceConfigInputUpdate}
			class="w-full shadow appearance-none border rounded px-3 py-2 text-gray"
		/>
	</div>
</div>
