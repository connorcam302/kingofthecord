<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { basicColumns, advancedColumns } from './columns.ts';
	import DataTable from './data-table.svelte';

	let { data } = $props();

	const { playerStats } = data;

	let statTab = $state('basic');
</script>

<svelte:head>
	<title>Stats</title>
</svelte:head>

<div class="flex flex-col gap-4 px-1">
	<div class="flex gap-2">
		<Button
			variant={statTab === 'basic' ? 'secondary' : 'outline'}
			onclick={() => (statTab = 'basic')}>Basic</Button
		>
		<Button
			variant={statTab === 'advanced' ? 'secondary' : 'outline'}
			onclick={() => (statTab = 'advanced')}>Advanced</Button
		>
	</div>

	<div class="w-96 overflow-auto md:w-full">
		{#if statTab === 'basic'}
			<DataTable data={playerStats} columns={basicColumns} />
		{:else if statTab === 'advanced'}
			<DataTable data={playerStats} columns={advancedColumns} />
		{/if}
	</div>
</div>
