<script lang="ts">
	import { getConfig, updateConfig } from '$lib/service';
	import { to_number } from 'svelte/internal';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

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
	<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">Service Configuration</h3>
	<div class="w-full">
		<Label for="serviceFailureRate">Failure Rate</Label>
		<Input
			id="serviceFailureRate"
			placeholder="Failure Rate"
			type="number"
			bind:value={serviceFailureRate}
			on:change={handleServiceConfigInputUpdate}
		/>
	</div>
	<div class="w-full">
		<Label for="serviceSleepTime">Sleep Time (s)</Label>
		<Input
			id="serviceSleepTime"
			placeholder="Sleep Time (s)"
			type="number"
			bind:value={serviceSleepTime}
			on:change={handleServiceConfigInputUpdate}
		/>
	</div>
</div>
