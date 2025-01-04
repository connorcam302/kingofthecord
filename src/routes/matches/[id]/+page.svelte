<script lang="ts">
	import DataTable from './data-table.svelte';
	import { basicColumns, advancedColumns } from './columns.js';
	import { Button } from '$lib/components/ui/button';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { matchData, matchId }: { matchData } = data;

	const teamOne = matchData.playerStats[0].team_number;
	const teamTwo = matchData.playerStats.filter((x: any) => x.team_number !== teamOne)[0]
		.team_number;
	console.log(matchData);

	let currentTab = $state('basic');
</script>

<div class="mx-auto max-w-screen-xl">
	<div class="flex flex-col gap-4">
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => (currentTab = 'basic')}>Basic</Button>
			<Button variant="outline" onclick={() => (currentTab = 'advanced')}>Advanced</Button>
		</div>
		{#await matchData}
			<p>...Waiting</p>
		{:then matchData}
			{#if currentTab === 'basic'}
				<div class="flex flex-col gap-2">
					<DataTable
						data={matchData.playerStats.filter((x) => x.team_number === teamOne)}
						columns={basicColumns}
					/>
					<DataTable
						data={matchData.playerStats.filter((x) => x.team_number === teamTwo)}
						columns={basicColumns}
					/>
				</div>
			{:else if currentTab === 'advanced'}
				<div class="flex flex-col gap-2">
					<DataTable
						data={matchData.playerStats.filter((x) => x.team_number === teamOne)}
						columns={advancedColumns}
					/>
					<DataTable
						data={matchData.playerStats.filter((x) => x.team_number === teamTwo)}
						columns={advancedColumns}
					/>
				</div>
			{/if}
		{/await}
	</div>
</div>
