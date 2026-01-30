<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import { getMapString, calculatePlayerRating } from '$lib/utils';
	import { ChevronDown, ChevronDownIcon, ChevronUp, Minus, MinusIcon } from 'lucide-svelte';
	import tippy from 'sveltejs-tippy';

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
</script>

<svelte:head>
	<title>King of the Cord</title>
</svelte:head>

<div class="mx-auto flex max-w-screen-xl flex-col gap-8">
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="text-center text-4xl">Leaderboard</div>
		<div class="mx-auto flex max-w-screen-xl flex-col justify-center gap-4 px-2">
			<div class="mx-auto w-fit overflow-hidden rounded-t-xl border text-sm md:text-base">
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
									<td class="border-y border-r text-center md:px-2">
										<div class="flex items-center justify-between gap-1">
											{#if playerStats
												.slice()
												.sort((a, b) => b.old_avg_hltvRating - a.old_avg_hltvRating)
												.findIndex((p) => p.steamid === player.steamid) > i}
												<div class="text-green-500"><ChevronUp /></div>
											{:else if playerStats
												.slice()
												.sort((a, b) => b.old_avg_hltvRating - a.old_avg_hltvRating)
												.findIndex((p) => p.steamid === player.steamid) < i}
												<div class="text-red-500"><ChevronDown /></div>
											{:else}
												<div><Minus /></div>
											{/if}
											<div>{i + 1}</div>
										</div>
									</td>
									<td class="border text-left md:px-2"
										><div class="w-32 truncate">
											<button
												onclick={() => goto(`/players/${player.steamid}`)}
												class="duration-200 hover:opacity-50"
											>
												{player.name}</button
											>
										</div></td
									>
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
									<td
										class="border-y border-l text-center md:px-2"
										use:tippy={{
											content:
												player.ratingChange.toFixed(2) >= 0
													? `<div class='text-green-500'>+${player.ratingChange.toFixed(2)}</div>`
													: `<div class='text-red-500'>${player.ratingChange.toFixed(2)}</div>`,
											allowHTML: true
										}}>{player.avg_hltvRating.toFixed(2)}</td
									>
								</tr>
							{:else}
								<tr class="transition-colors hover:bg-slate-900">
									<td class="border-r border-t text-center md:px-2"
										><div class="flex items-center justify-between gap-1">
											{#if playerStats
												.slice()
												.sort((a, b) => b.old_avg_hltvRating - a.old_avg_hltvRating)
												.findIndex((p) => p.steamid === player.steamid) > i}
												<div class="text-green-500"><ChevronUp /></div>
											{:else if playerStats
												.slice()
												.sort((a, b) => b.old_avg_hltvRating - a.old_avg_hltvRating)
												.findIndex((p) => p.steamid === player.steamid) < i}
												<div class="text-red-500"><ChevronDown /></div>
											{:else}
												<div><Minus /></div>
											{/if}
											<div>{i + 1}</div>
										</div></td
									>
									<td class="border-r border-t text-left md:px-2"
										><button
											onclick={() => goto(`/players/${player.steamid}`)}
											class="duration-200 hover:opacity-50"
										>
											{player.name}</button
										></td
									>
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
									<td
										class="border-t text-center md:px-2"
										use:tippy={{
											content:
												player.ratingChange.toFixed(2) >= 0
													? `<div class='text-green-500'>+${player.ratingChange.toFixed(2)}</div>`
													: `<div class='text-red-500'>${player.ratingChange.toFixed(2)}</div>`,
											allowHTML: true
										}}>{player.avg_hltvRating.toFixed(2)}</td
									>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	{#if matchData.length > 0}
		{@const recentMatches = matchData
			.sort((a, b) => b.lobbyInfo.timestamp - a.lobbyInfo.timestamp)
			.slice(0, 1)}
		<div class="flex flex-col items-center gap-4 px-2">
			<div class="text-center text-2xl font-bold">Recent Match</div>
			{#each recentMatches as match}
				{@const team1Players = match.playerStats
					.filter((x) => x.team_number === 2)
					.sort((a, b) => b.kills_total - a.kills_total)}
				{@const team2Players = match.playerStats
					.filter((x) => x.team_number === 3)
					.sort((a, b) => b.kills_total - a.kills_total)}
				{@const gameLength = ticksToMMSS(match.rounds[match.rounds.length - 1].start)}
				{@const team1Won =
					match.rounds[match.rounds.length - 1].teamOneScore >
					match.rounds[match.rounds.length - 1].teamTwoScore}
				<button
					class="w-full overflow-hidden rounded-lg md:w-[42rem]"
					style={`background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), url('/maps/${match.lobbyInfo.map_name}.webp');background-size: cover; background-position: center;`}
					onclick={() => goto(`/matches/${match.lobbyInfo.id}`)}
				>
					<div class="flex flex-col items-center gap-4 p-6">
						<div class="flex items-center justify-center gap-4">
							<div class="flex items-center justify-center gap-4">
								<div class="text-5xl font-bold">
									{match.rounds[match.rounds.length - 1].teamOneScore}
								</div>
							</div>
							<div class="text-3xl text-slate-500">-</div>
							<div class="flex items-center justify-center gap-4">
								<div class="text-5xl font-bold">
									{match.rounds[match.rounds.length - 1].teamTwoScore}
								</div>
							</div>
						</div>
						<div class="flex flex-col items-center justify-center gap-1">
							<div class="">{dayjs(match.lobbyInfo.timestamp * 1000).toString()}</div>
							<div class="">
								{gameLength}
							</div>
						</div>
						<div class="flex w-full flex-col gap-4 md:flex-row md:gap-8">
							<div
								class="flex-1 overflow-hidden rounded-lg border {team1Won
									? 'border-green-900 bg-green-950/50'
									: 'border-red-900 bg-red-950/50'}"
							>
								<div
									class="{team1Won
										? 'bg-green-900/50'
										: 'bg-red-900/50'} p-2 text-center font-bold {team1Won
										? 'text-green-400'
										: 'text-red-400'}"
								>
									Team 1
								</div>
								<div
									class="flex justify-between {team1Won
										? 'bg-green-900/30'
										: 'bg-red-900/30'} px-3 py-1 text-xs font-semibold uppercase text-slate-400"
								>
									<span class="w-20 text-left">Name</span>
									<div class="flex gap-3">
										<span class="w-6 text-center">K</span>
										<span class="w-6 text-center">D</span>
										<span class="w-6 text-center">A</span>
										<span class="w-8 text-center">R</span>
										<span class="w-8 text-center">+/-</span>
									</div>
								</div>
								<div class="divide-y {team1Won ? 'divide-green-900/30' : 'divide-red-900/30'}">
									{#each team1Players as player}
										{@const rating = calculatePlayerRating(player, match.rounds.length)}
										{@const playerStat = playerStats.find((p) => p.steamid === player.steamid)}
										{@const ratingChange = playerStat?.ratingChange || 0}
										<div class="flex items-center justify-between px-3 py-1.5">
											<button
												class="w-20 truncate text-left text-sm hover:opacity-70"
												onclick={() => goto(`/players/${player.steamid}`)}
											>
												{player.name}
											</button>
											<div class="flex gap-3 font-mono text-sm">
												<span class="w-6 text-center">{player.kills_total}</span>
												<span class="w-6 text-center">{player.deaths_total}</span>
												<span class="w-6 text-center">{player.assists_total}</span>
												<span class="w-8 text-center">{rating.hltvRating.toFixed(2)}</span>
												<span
													class="w-8 text-center {ratingChange >= 0
														? 'text-green-400'
														: 'text-red-400'}"
												>
													{ratingChange >= 0 ? '+' : ''}{ratingChange.toFixed(2)}
												</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div
								class="flex-1 overflow-hidden rounded-lg border {team1Won
									? 'border-red-900 bg-red-950/50'
									: 'border-green-900 bg-green-950/50'}"
							>
								<div
									class="{team1Won
										? 'bg-red-900/50'
										: 'bg-green-900/50'} p-2 text-center font-bold {team1Won
										? 'text-red-400'
										: 'text-green-400'}"
								>
									Team 2
								</div>
								<div
									class="flex justify-between {team1Won
										? 'bg-red-900/30'
										: 'bg-green-900/30'} px-3 py-1 text-xs font-semibold uppercase text-slate-400"
								>
									<span class="w-20 text-left">Name</span>
									<div class="flex gap-3">
										<span class="w-6 text-center">K</span>
										<span class="w-6 text-center">D</span>
										<span class="w-6 text-center">A</span>
										<span class="w-8 text-center">R</span>
										<span class="w-8 text-center">+/-</span>
									</div>
								</div>
								<div class="divide-y {team1Won ? 'divide-red-900/30' : 'divide-green-900/30'}">
									{#each team2Players as player}
										{@const rating = calculatePlayerRating(player, match.rounds.length)}
										{@const playerStat = playerStats.find((p) => p.steamid === player.steamid)}
										{@const ratingChange = playerStat?.ratingChange || 0}
										<div class="flex items-center justify-between px-3 py-1.5">
											<button
												class="w-20 truncate text-left text-sm hover:opacity-70"
												onclick={() => goto(`/players/${player.steamid}`)}
											>
												{player.name}
											</button>
											<div class="flex gap-3 font-mono text-sm">
												<span class="w-6 text-center">{player.kills_total}</span>
												<span class="w-6 text-center">{player.deaths_total}</span>
												<span class="w-6 text-center">{player.assists_total}</span>
												<span class="w-8 text-center">{rating.hltvRating.toFixed(2)}</span>
												<span
													class="w-8 text-center {ratingChange >= 0
														? 'text-green-400'
														: 'text-red-400'}"
												>
													{ratingChange >= 0 ? '+' : ''}{ratingChange.toFixed(2)}
												</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="text-center text-4xl">Matches</div>
		<div class="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap">
			{#each matchData.sort((a, b) => b.lobbyInfo.timestamp - a.lobbyInfo.timestamp) as match, i}
				<button
					class="relative w-96 rounded-lg p-4 md:p-4"
					style={`background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/maps/${match.lobbyInfo.map_name}.webp');background-size: cover; background-position: center;`}
					onclick={() => goto(`/matches/${match.lobbyInfo.id}`)}
				>
					<div
						class="absolute right-2 top-2 rounded px-2 py-1 text-xs font-bold"
						class:bg-blue-600={match.season === 1}
						class:bg-green-600={match.season === 2}
						class:bg-gray-600={match.season === undefined || match.season === null}
					>
						{match.season ? `Season ${match.season}` : 'Season ?'}
					</div>
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
									<a
										href="/players/{player.steamid}"
										class="w-44 truncate transition-colors hover:text-blue-400">{player.name}</a
									>
								{/each}
							</div>
							<div class="flex w-44 flex-col gap-1 truncate text-right">
								{#each match.playerStats.filter((x) => x.team_number === 3) as player}
									<a
										href="/players/{player.steamid}"
										class="w-44 truncate transition-colors hover:text-blue-400">{player.name}</a
									>
								{/each}
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
