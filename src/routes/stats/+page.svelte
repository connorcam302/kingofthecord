<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { basicColumns, advancedColumns } from './columns';
	import DataTable from './data-table.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getMapString } from '$lib/utils';

	let { data } = $props();

	const { playerStats, seasons } = data;

	let statTab = $state('basic');
	let mapFilter = $state('all');
	let seasonFilter = $state('all');

	const getUniqueMaps = () => {
		const maps = new Set<string>();
		playerStats.forEach((player: any) => {
			player.mapStats?.forEach((match: any) => {
				if (match.map) maps.add(match.map);
			});
		});
		return Array.from(maps).sort();
	};

	const filterPlayerStats = () => {
		return playerStats.map((player: any) => {
			let filteredMatches = player.mapStats || [];

			if (mapFilter !== 'all') {
				filteredMatches = filteredMatches.filter((m: any) => m.map === mapFilter);
			}

			if (seasonFilter !== 'all') {
				filteredMatches = filteredMatches.filter((m: any) => m.season === parseInt(seasonFilter));
			}

			if (filteredMatches.length === 0) {
				return { ...player, avgRating: 0, matches: 0 };
			}

			const totalRating = filteredMatches.reduce((sum: number, m: any) => sum + m.hltvRating, 0);
			const totalKills = filteredMatches.reduce((sum: number, m: any) => sum + m.kills_total, 0);
			const totalDeaths = filteredMatches.reduce((sum: number, m: any) => sum + m.deaths_total, 0);
			const totalAssists = filteredMatches.reduce(
				(sum: number, m: any) => sum + m.assists_total,
				0
			);
			const totalAdr = filteredMatches.reduce((sum: number, m: any) => sum + m.adr, 0);
			const totalFlashes = filteredMatches.reduce(
				(sum: number, m: any) => sum + m.enemies_flashed_total,
				0
			);
			const totalUtility = filteredMatches.reduce(
				(sum: number, m: any) => sum + m.utility_damage_total,
				0
			);
			const wins = filteredMatches.filter((m: any) => m.didPlayerWin).length;

			const rounds = filteredMatches.reduce((sum: number, m: any) => sum + (m.rounds || 30), 0);

			return {
				...player,
				mapStats: filteredMatches,
				kpr: totalKills / rounds,
				dpr: totalDeaths / rounds,
				apr: totalAssists / rounds,
				adr: totalAdr / filteredMatches.length,
				kills: totalKills,
				deaths: totalDeaths,
				assists: totalAssists,
				flashes: totalFlashes / filteredMatches.length,
				utilityDamage: totalUtility / filteredMatches.length,
				winRate: (wins / filteredMatches.length) * 100,
				matches: filteredMatches.length,
				avgRating: totalRating / filteredMatches.length
			};
		});
	};

	let filteredStats = $derived(filterPlayerStats());
	let uniqueMaps = $derived(getUniqueMaps());
</script>

<svelte:head>
	<title>Stats</title>
</svelte:head>

<div class="flex flex-col gap-4 px-1">
	<div class="flex flex-wrap items-center gap-4">
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
		<div class="flex gap-2">
			<Select.Root type="single" bind:value={mapFilter}>
				<Select.Trigger class="w-32"
					>{mapFilter === 'all' ? 'Select Map' : getMapString(mapFilter)}</Select.Trigger
				>
				<Select.Content>
					<Select.Item value="all">All</Select.Item>
					{#each uniqueMaps as map}
						<Select.Item value={map}>{getMapString(map)}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={seasonFilter}>
				<Select.Trigger class="w-32"
					>{seasonFilter === 'all' ? 'All Seasons' : `Season ${seasonFilter}`}</Select.Trigger
				>
				<Select.Content>
					<Select.Item value="all">All Seasons</Select.Item>
					{#each seasons as season}
						<Select.Item value={season.toString()}>Season {season}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="w-96 overflow-auto md:w-full">
		{#if statTab === 'basic'}
			<DataTable data={filteredStats} columns={basicColumns} />
		{:else if statTab === 'advanced'}
			<DataTable data={filteredStats} columns={advancedColumns} />
		{/if}
	</div>
</div>
