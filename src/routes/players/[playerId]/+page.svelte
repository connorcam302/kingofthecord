<script lang="ts">
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import { getMapString, getName } from '$lib/utils';

	import * as Select from '$lib/components/ui/select/index.js';
	import {
		ArrowDown,
		ArrowUp,
		CandlestickChart,
		CrosshairIcon,
		Handshake,
		Skull,
		Sword
	} from 'lucide-svelte';
	import tippy from 'sveltejs-tippy';
	import advancedFormat from 'dayjs/plugin/advancedFormat';
	import Button from '$lib/components/ui/button/button.svelte';
	import MapTable from './MapTable.svelte';
	import DuelTable from './DuelTable.svelte';
	import RatingBreakdown from './RatingBreakdown.svelte';
	import { basicColumns, duelColumns } from './columns';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	dayjs.extend(advancedFormat);

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const { stats, maps, duels, accolades, seasons } = data;

	let mapFilter = $state('all');
	let sortedBy = $state('date');
	let sortDirection = $state('desc');
	let seasonFilter = $state('all');
	let ratingDialogOpen = $state(false);

	const getRankClass = (rank: number, total: number) => {
		if (rank === 1) return 'bg-yellow-500 text-yellow-950';
		if (rank === 2) return 'bg-gray-300 text-gray-800';
		if (rank === 3) return 'bg-orange-700 text-orange-100';
		if (total - rank <= 2) return 'bg-amber-900 text-amber-200';
		return 'bg-primary/20 text-primary';
	};

	const filterMatches = (matches, mapFilter, sortedBy, sortDirection, seasonFilter) => {
		let filteredMatches = matches;
		if (mapFilter !== 'all') {
			filteredMatches = filteredMatches.filter((x) => x.map === mapFilter);
		}
		if (seasonFilter !== 'all') {
			filteredMatches = filteredMatches.filter((x) => x.season === parseInt(seasonFilter));
		}
		filteredMatches = filteredMatches.sort((a, b) => {
			if (sortedBy === 'date') {
				if (sortDirection === 'asc') {
					return a.timestamp - b.timestamp;
				} else {
					return b.timestamp - a.timestamp;
				}
			} else if (sortedBy === 'Kills') {
				if (sortDirection === 'asc') {
					return a.kills_total - b.kills_total;
				} else {
					return b.kills_total - a.kills_total;
				}
			} else if (sortedBy === 'Deaths') {
				if (sortDirection === 'asc') {
					return a.deaths_total - b.deaths_total;
				} else {
					return b.deaths_total - a.deaths_total;
				}
			} else if (sortedBy === 'Assists') {
				if (sortDirection === 'asc') {
					return a.assists_total - b.assists_total;
				} else {
					return b.assists_total - a.assists_total;
				}
			} else if (sortedBy === 'ADR') {
				if (sortDirection === 'asc') {
					return a.adr - b.adr;
				} else {
					return b.adr - a.adr;
				}
			} else if (sortedBy === 'Rating') {
				if (sortDirection === 'asc') {
					return a.hltvRating - b.hltvRating;
				} else {
					return b.hltvRating - a.hltvRating;
				}
			}
		});

		return filteredMatches;
	};

	const filterDuels = (duels, mapFilter, seasonFilter) => {
		let filteredDuels = duels;
		if (mapFilter !== 'all') {
			filteredDuels = filteredDuels.filter((x) => x.map === mapFilter);
		}
		if (seasonFilter !== 'all') {
			filteredDuels = filteredDuels.filter((x) => {
				const match = stats.mapStats.find((m) => m.matchId === x.id);
				return match && match.season === parseInt(seasonFilter);
			});
		}

		const duelStatsRaw = [];

		filteredDuels.forEach((duels) => {
			Object.values(duels.duels).forEach((duel) => {
				let existingDuelStat = duelStatsRaw.find((x) => x.defender === duel.defender);

				if (!existingDuelStat) {
					existingDuelStat = {
						defender: duel.defender,
						attackerScore: 0,
						defenderScore: 0
					};
					duelStatsRaw.push(existingDuelStat);
				}

				existingDuelStat.attackerScore += duel.attackerScore;
				existingDuelStat.defenderScore += duel.defenderScore;
			});
		});

		const duelStats = duelStatsRaw
			.map((duels) => {
				return {
					id: duels.defender,
					name: getName({ steamid: duels.defender, name: duels.name }),
					duels: duels.attackerScore + duels.defenderScore,
					winRate: (duels.attackerScore / (duels.attackerScore + duels.defenderScore)) * 100,
					wins: duels.attackerScore
				};
			})
			.filter((x) => x.name !== undefined)
			.sort((a, b) => b.duels - a.duels);
		return duelStats;
	};

	const filterMapStats = (filteredMatches) => {
		const mapStatsMap = {};

		filteredMatches.forEach((match) => {
			const mapName = getMapString(match.map);
			if (!mapStatsMap[mapName]) {
				mapStatsMap[mapName] = {
					name: mapName,
					totalKills: 0,
					totalDeaths: 0,
					totalAssists: 0,
					totalAdr: 0,
					totalRating: 0,
					wins: 0,
					matches: 0
				};
			}
			mapStatsMap[mapName].totalKills += match.kills_total;
			mapStatsMap[mapName].totalDeaths += match.deaths_total;
			mapStatsMap[mapName].totalAssists += match.assists_total;
			mapStatsMap[mapName].totalAdr += match.adr;
			mapStatsMap[mapName].totalRating += match.hltvRating;
			mapStatsMap[mapName].wins += match.didPlayerWin ? 1 : 0;
			mapStatsMap[mapName].matches += 1;
		});

		return Object.values(mapStatsMap).map((stat: any) => ({
			name: stat.name,
			matches: stat.matches,
			winRate: ((stat.wins / stat.matches) * 100).toFixed(0) + ' %',
			avgKills: (stat.totalKills / stat.matches).toFixed(1),
			avgDeaths: (stat.totalDeaths / stat.matches).toFixed(1),
			avgAssists: (stat.totalAssists / stat.matches).toFixed(1),
			avgAdr: Math.round(stat.totalAdr / stat.matches).toString(),
			avgRating: (stat.totalRating / stat.matches).toFixed(2)
		}));
	};

	const calculateFilteredStats = (filteredMatches) => {
		if (filteredMatches.length === 0) {
			return { kpr: 0, dpr: 0, apr: 0, adr: 0, kills: 0, deaths: 0, assists: 0, avgRating: 0 };
		}
		const kills = filteredMatches.reduce((sum, m) => sum + m.kills_total, 0);
		const deaths = filteredMatches.reduce((sum, m) => sum + m.deaths_total, 0);
		const assists = filteredMatches.reduce((sum, m) => sum + m.assists_total, 0);
		const adr = filteredMatches.reduce((sum, m) => sum + m.adr, 0) / filteredMatches.length;
		const rounds = filteredMatches.reduce((sum, m) => sum + m.rounds, 0);

		const recentGames = filteredMatches.slice(0, 20);
		const maxWeight = Math.log(11);
		let weightedSum = 0;
		let totalWeight = 0;
		recentGames.forEach((game, index) => {
			let weight;
			if (index < 10) {
				weight = 1;
			} else {
				weight = Math.log(21 - index) / maxWeight;
			}
			weightedSum += game.hltvRating * weight;
			totalWeight += weight;
		});
		const avgRating = totalWeight > 0 ? weightedSum / totalWeight : 0;

		return {
			kpr: (kills / rounds).toFixed(2),
			dpr: (deaths / rounds).toFixed(2),
			apr: (assists / rounds).toFixed(2),
			adr: adr.toFixed(0),
			kills,
			deaths,
			assists,
			avgRating
		};
	};

	let matches = $state(
		filterMatches(stats.mapStats, mapFilter, sortedBy, sortDirection, seasonFilter)
	);
	let duelStats = $state(filterDuels(duels, mapFilter, seasonFilter));
	let filteredStats = $derived(calculateFilteredStats(matches));
	let filteredMapStats = $derived(filterMapStats(matches));

	$effect(() => {
		matches = filterMatches(stats.mapStats, mapFilter, sortedBy, sortDirection, seasonFilter);
		duelStats = filterDuels(duels, mapFilter, seasonFilter);
	});
</script>

<svelte:head>
	<title>KOTC | {stats.name}</title>
</svelte:head>

<div class="mx-auto flex max-w-screen-xl flex-col gap-8 px-1">
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<div class="flex items-center gap-4">
			<div class="text-4xl font-semibold">{stats.name}</div>
			{#if accolades && (accolades.currentSeasonRank || accolades.previousSeasonRank)}
				<div class="flex gap-2">
					{#if accolades.currentSeasonRank}
						<div
							class="cursor-help rounded-full px-3 py-1 text-xs font-medium {getRankClass(
								accolades.currentSeasonRank,
								accolades.currentSeasonTotal
							)}"
							use:tippy={{
								content: `Rank ${accolades.currentSeasonRank} of ${accolades.currentSeasonTotal} players<br>${accolades.currentSeasonMatches} matches played<br>Rating: ${accolades.currentSeasonRating.toFixed(2)}`,
								allowHTML: true
							}}
						>
							S{seasons[seasons.length - 1]} #{accolades.currentSeasonRank}
						</div>
					{/if}
					{#if accolades.previousSeasonRank}
						<div
							class="cursor-help rounded-full px-3 py-1 text-xs font-medium {getRankClass(
								accolades.previousSeasonRank,
								accolades.previousSeasonTotal
							)}"
							use:tippy={{
								content: `Rank ${accolades.previousSeasonRank} of ${accolades.previousSeasonTotal} players<br>${accolades.previousSeasonMatches} matches played<br>Rating: ${accolades.previousSeasonRating.toFixed(2)}`,
								allowHTML: true
							}}
						>
							S{seasons[seasons.length - 2]} #{accolades.previousSeasonRank}
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<div class="flex flex-wrap justify-center gap-3">
			<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
				<Sword class="h-4 w-4 text-red-500" />
				<span class="font-medium">Kills</span>
				<span class="font-bold text-foreground">{filteredStats.kills}</span>
			</div>
			<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
				<Skull class="h-4 w-4 text-slate-400" />
				<span class="font-medium">Deaths</span>
				<span class="font-bold text-foreground">{filteredStats.deaths}</span>
			</div>
			<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
				<Handshake class="h-4 w-4 text-blue-400" />
				<span class="font-medium">Assists</span>
				<span class="font-bold text-foreground">{filteredStats.assists}</span>
			</div>
			<div class="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm">
				<CrosshairIcon class="h-4 w-4 text-yellow-500" />
				<span class="font-medium">ADR</span>
				<span class="font-bold text-foreground">{filteredStats.adr}</span>
			</div>
			<button
				class="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm transition-colors hover:bg-primary/30"
				onclick={() => (ratingDialogOpen = true)}
			>
				<CandlestickChart class="h-4 w-4 text-primary" />
				<span class="font-medium">Rating</span>
				<span class="font-bold text-primary">{filteredStats.avgRating.toFixed(2)}</span>
			</button>
		</div>
	</div>
	<Dialog.Root open={ratingDialogOpen} onOpenChange={(v) => (ratingDialogOpen = v)}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Dialog.Content
				class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
			>
				<RatingBreakdown mapStats={matches} />
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
	<div class="flex flex-col-reverse gap-4 md:flex-row">
		<div class="flex w-full flex-col gap-2 overflow-x-auto">
			<div class="flex flex-wrap gap-2">
				<div class="flex gap-2">
					<Select.Root type="single" bind:value={mapFilter}>
						<Select.Trigger class="w-32"
							>{mapFilter === 'all' ? 'Select Map' : getMapString(mapFilter)}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="all">All</Select.Item>
							{#each Array.from(new Set(stats.mapStats.map((x) => x.map))).sort() as map}
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
							{#each data.seasons as season}
								<Select.Item value={season.toString()}>Season {season}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex gap-2">
					<Select.Root type="single" bind:value={sortedBy}>
						<Select.Trigger class="w-28"
							>{sortedBy === 'date' ? 'Sort By' : sortedBy}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="date">Start Date</Select.Item>
							<Select.Item value="Kills">Kills</Select.Item>
							<Select.Item value="Deaths">Deaths</Select.Item>
							<Select.Item value="Assists">Assists</Select.Item>
							<Select.Item value="ADR">ADR</Select.Item>
							<Select.Item value="Rating">Rating</Select.Item>
						</Select.Content>
					</Select.Root>
					<Button
						variant="outline"
						size="sm"
						onclick={() => (sortDirection = sortDirection === 'asc' ? 'desc' : 'asc')}
					>
						{#if sortDirection === 'asc'}
							<ArrowUp class="h-4 w-4" />
						{:else}
							<ArrowDown class="h-4 w-4" />
						{/if}
					</Button>
				</div>
			</div>
			<div class="flex w-fit flex-col items-center justify-center gap-4">
				{#each matches as match}
					<div class="flex flex-col items-center justify-center gap-4">
						<button onclick={() => goto(`/matches/${match.matchId}`)}>
							<div
								class="relative w-96 grow rounded-lg border p-4 md:p-4"
								style={`background-image: linear-gradient(rgba(0, 0, 0, 0.4), ${match.didPlayerWin ? 'rgba(20, 83, 45, 0.7)' : 'rgba(127, 29, 29, 0.7)'}), url('/maps/${match.map}.webp');background-size: cover; background-position: center;`}
							>
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between gap-2 text-left text-sm">
										<div class="flex flex-col">
											<div class=" flex items-center gap-2">
												<div
													class="rounded px-2 py-1 text-xs font-bold"
													class:bg-blue-600={match.season === 1}
													class:bg-green-600={match.season === 2}
													class:bg-gray-600={match.season === undefined || match.season === null}
												>
													{match.season ? `Season ${match.season}` : 'Season ?'}
												</div>
												{dayjs(match.timestamp * 1000).format('Do MMM YYYY HH:mm')}
											</div>
											<div>{getMapString(match.map)}</div>
										</div>
										<div class="text-2xl">{match.teamOneScore} - {match.teamTwoScore}</div>
									</div>
									<div class="flex gap-2 text-left text-sm md:text-base">
										<div
											class="flex w-24 items-center gap-1 text-lg"
											use:tippy={{ content: 'Kills' }}
										>
											<Sword />
											{match.kills_total}
										</div>
										<div
											class="flex w-24 items-center gap-1 text-lg"
											use:tippy={{ content: 'Deaths' }}
										>
											<Skull />
											{match.deaths_total}
										</div>
										<div
											class="flex w-24 items-center gap-1 text-lg"
											use:tippy={{ content: 'Assists' }}
										>
											<Handshake />
											{match.assists_total}
										</div>
										<div
											class="flex w-32 items-center justify-end gap-1 text-lg md:w-32"
											use:tippy={{ content: 'ADR' }}
										>
											<CrosshairIcon />
											{match.adr.toFixed(0)}
										</div>
										<div
											class="flex w-32 items-center justify-end gap-1 text-lg"
											use:tippy={{ content: 'Rating' }}
										>
											<CandlestickChart />
											{match.hltvRating}
										</div>
									</div>
								</div>
							</div>
						</button>
					</div>
				{/each}
			</div>
		</div>
		<div class="flex w-96 flex-col gap-4 overflow-auto md:w-full">
			<MapTable data={filteredMapStats} columns={basicColumns} />
			{#key duelStats}
				<DuelTable data={duelStats} columns={duelColumns} />
			{/key}
		</div>
	</div>
</div>
