<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import { getMapString } from '$lib/utils';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const { matchIds, matchData, playerStats } = data;

	const ticksToMMSS = (ticks: number) => {
		return (
			('00' + Math.floor(ticks / 64 / 60)).slice(-2) +
			':' +
			('00' + (Math.floor(ticks / 64) % 60)).slice(-2)
		);
	};

	console.log(data);
</script>

<svelte:head>
	<title>King of the Cord</title>
</svelte:head>

<div class="mx-auto flex max-w-screen-xl flex-col gap-8 px-1">
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="text-center text-4xl">Leaderboard</div>
		<div class="mx-auto flex max-w-screen-xl flex-col justify-center gap-4 px-1">
			<div class="mx-auto w-fit rounded-xl border">
				<table>
					<thead>
						<tr class="bg-slate-900">
							<th class="md:p-2">#</th>
							<th class="md:p-2">Name</th>
							<th class="md:p-2">Maps</th>
							<th class="md:p-2">Win Rate</th>
							<th class="md:p-2">K/D-Diff</th>
							<th class="md:p-2">K/D</th>
							<th class="md:p-2">Rating</th>
						</tr>
					</thead>
					<tbody>
						{#each playerStats.sort((a, b) => b.avg_hltvRating - a.avg_hltvRating) as player, i}
							{#if i !== playerStats.length - 1}
								<tr class="transition-colors hover:bg-slate-900">
									<td class="border-y border-r text-center md:px-2">{i + 1}</td>
									<td class="border text-left md:px-2">{player.name}</td>
									<td class="border text-center md:px-2">{player.mapStats.length}</td>
									<td class="border text-center md:px-2"
										>{(
											(100 * player.mapStats.filter((x) => x.isWinningTeam === true).length) /
											player.mapStats.length
										).toFixed(0)}%</td
									>
									<td class="border text-center md:px-2">{player.kills - player.deaths}</td>
									<td class="border text-center md:px-2"
										>{(player.kills / player.deaths).toFixed(2)}</td
									>
									<td class="border-y border-l text-center md:px-2"
										>{player.avg_hltvRating.toFixed(2)}</td
									>
								</tr>
							{:else}
								<tr class="transition-colors hover:bg-slate-900">
									<td class="border-r border-t text-center md:px-2">{i + 1}</td>
									<td class="border-r border-t text-left md:px-2">{player.name}</td>
									<td class="border-r border-t text-center md:px-2">{player.mapStats.length}</td>
									<td class="border-r border-t text-center md:px-2"
										>{(
											(100 * player.mapStats.filter((x) => x.isWinningTeam === true).length) /
											player.mapStats.length
										).toFixed(0)}%</td
									>
									<td class="border-r border-t text-center md:px-2"
										>{player.kills - player.deaths}</td
									>
									<td class="border-r border-t text-center md:px-2"
										>{(player.kills / player.deaths).toFixed(2)}</td
									>
									<td class="border-t text-center md:px-2">{player.avg_hltvRating.toFixed(2)}</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="text-center text-4xl">Matches</div>
		<div class="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap">
			{#each matchData.sort((a, b) => b.lobbyInfo.timestamp - a.lobbyInfo.timestamp) as match, i}
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
