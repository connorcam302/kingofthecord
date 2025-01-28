<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getMapString } from '$lib/utils';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const { matchData } = data;

	const ticksToMMSS = (ticks: number) => {
		return (
			('00' + Math.floor(ticks / 64 / 60)).slice(-2) +
			':' +
			('00' + (Math.floor(ticks / 64) % 60)).slice(-2)
		);
	};

	let mapFilter = $state('all');
	let playerFilter = $state('all');

	const filterMatches = (matches, mapFilter, playerFilter) => {
		let filteredMatches = matches;
		if (mapFilter !== 'all') {
			filteredMatches = filteredMatches.filter((x) => x.lobbyInfo.map_name === mapFilter);
		}
		if (playerFilter !== 'all') {
			filteredMatches = filteredMatches.filter((x) =>
				x.playerStats.find((y) => y.steamid === playerFilter)
			);
		}

		return filteredMatches;
	};

	const matches = $derived(filterMatches(matchData, mapFilter, playerFilter));
</script>

<svelte:head>
	<title>Matches</title>
</svelte:head>

<div class="mx-auto flex max-w-screen-xl flex-col gap-8 px-1">
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="w-full max-w-screen-lg">
			<div class="flex w-full grow flex-col items-center justify-between gap-4 md:flex-row">
				<div class="flex gap-4">
					<Select.Root type="single" bind:value={mapFilter}>
						<Select.Trigger class="w-[180px]"
							>{mapFilter === 'all' ? 'Select Map' : getMapString(mapFilter)}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="all">All</Select.Item>
							{#each Array.from(new Set(matchData.map((x) => x.lobbyInfo.map_name))).sort() as map}
								<Select.Item value={map}>{getMapString(map)}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Select.Root type="single" bind:value={playerFilter}>
						<Select.Trigger class="w-[180px]"
							>{playerFilter === 'all'
								? 'Select Player'
								: data.playerStats.find((x) => x.steamid === playerFilter).name}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="all">All</Select.Item>
							{#each data.playerStats.sort((a, b) => a.name.localeCompare(b.name)) as player}
								<Select.Item value={player.steamid}>{player.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="text-right text-slate-400">
					Matches displayed: {matches.length}
				</div>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap">
			{#each matches.sort((a, b) => b.lobbyInfo.timestamp - a.lobbyInfo.timestamp) as match, i}
				<button
					class="w-96 rounded-lg p-4 md:p-4"
					style={`background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/maps/${match.lobbyInfo.map_name}.webp');background-size: cover; background-position: center;`}
					onclick={() => goto(`/matches/${match.lobbyInfo.id}`)}
				>
					<div class="flex flex-col items-center gap-2">
						<div class="flex items-center justify-center gap-2">
							<div class="flex items-center justify-center gap-4">
								<div class="text-4xl">{match.rounds[match.rounds.length - 1].teamOneScore}</div>
							</div>
							<div class="text-2xl">-</div>
							<div class="flex items-center justify-center gap-4">
								<div class="text-4xl">{match.rounds[match.rounds.length - 1].teamTwoScore}</div>
							</div>
						</div>
						<div class="flex flex-col items-center justify-center gap-1">
							<div>{dayjs(match.lobbyInfo.timestamp * 1000).toString()}</div>
							<div>
								{ticksToMMSS(match.rounds[match.rounds.length - 1].start)}
							</div>
						</div>
						<div class="flex max-w-screen-sm items-center justify-between px-2">
							<div class="flex w-44 flex-col gap-1 truncate text-left">
								{#each match.playerStats.filter((x) => x.team_number === 2) as player}
									<div class="w-44 truncate">{player.name}</div>
								{/each}
							</div>
							<div class="flex w-44 flex-col gap-1 truncate text-right">
								{#each match.playerStats.filter((x) => x.team_number === 3) as player}
									<div class="w-44 truncate">{player.name}</div>
								{/each}
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
