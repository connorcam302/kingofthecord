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
	import HltvTimeline from './HltvTimeline.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import MapTable from './MapTable.svelte';
	import DuelTable from './DuelTable.svelte';
	import { basicColumns, duelColumns } from './columns';
	import HltvGroupings from './HltvGroupings.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	dayjs.extend(advancedFormat);

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	console.log(data);

	const { stats, hltvTimeline, maps, duels } = data;

	let duration = $state('30d');

	const filterDuration = (timeline, duration) => {
		if (duration === 'all') {
			return timeline;
		} else if (duration === '90d') {
			//timestamp looks like the following 1737926942
			return timeline.filter(
				(d) => d.currentMatch.timestamp > dayjs(Date.now() - 90 * 24 * 60 * 60 * 1000).unix()
			);
		} else if (duration === '30d') {
			return timeline.filter(
				(d) => d.currentMatch.timestamp > dayjs(Date.now() - 30 * 24 * 60 * 60 * 1000).unix()
			);
		} else if (duration === '14d') {
			return timeline.filter(
				(d) => d.currentMatch.timestamp > dayjs(Date.now() - 14 * 24 * 60 * 60 * 1000).unix()
			);
		} else if (duration === '7d') {
			return timeline.filter(
				(d) => d.currentMatch.timestamp > dayjs(Date.now() - 7 * 24 * 60 * 60 * 1000).unix()
			);
		} else if (duration === '1d') {
			return timeline.filter(
				(d) => d.currentMatch.timestamp > dayjs(Date.now() - 24 * 60 * 60 * 1000).unix()
			);
		}
	};

	let filteredTimeline = $derived(filterDuration(hltvTimeline, duration));

	let mapFilter = $state('all');
	let sortedBy = $state('date');
	let sortDirection = $state('desc');
	let intervalInput = $state();
	let interval = $state(0.1);

	const filterMatches = (matches, mapFilter, sortedBy, sortDirection) => {
		let filteredMatches = matches;
		if (mapFilter !== 'all') {
			filteredMatches = filteredMatches.filter((x) => x.map === mapFilter);
		}
		// sort by the sorted by criteria and sort direction
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
					return a.rawHltv.adr - b.rawHltv.adr;
				} else {
					return b.rawHltv.adr - a.rawHltv.adr;
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

	const filterDuels = (duels, mapFilter) => {
		let filteredDuels = duels;
		if (mapFilter !== 'all') {
			filteredDuels = filteredDuels.filter((x) => x.map === mapFilter);
		}

		// filtered duels contains the duel stats for each map, each will be an array of 5 objects like the following 76561198040636119: {attackerScore: 8, defenderScore: 1}. Total up the players attackerScore and defenderScore against each player

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

		console.log(duelStats);
		return duelStats;
	};

	let matches = $state(filterMatches(stats.mapStats, mapFilter, sortedBy, sortDirection));
	let duelStats = $state(filterDuels(duels, mapFilter));

	$effect(() => {
		matches = filterMatches(stats.mapStats, mapFilter, sortedBy, sortDirection);
		duelStats = filterDuels(duels, mapFilter);
	});
</script>

<svelte:head>
	<title>KOTC | {stats.name}</title>
</svelte:head>

<div class="mx-auto flex max-w-screen-xl flex-col gap-8 px-1">
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<div>
			<div class="text-4xl font-semibold">{stats.name}</div>
		</div>
		<div class="flex w-full justify-between px-2 md:justify-end md:gap-8">
			<div class="flex items-center gap-1 text-lg" use:tippy={{ content: 'Kills' }}>
				<Sword />
				{(stats.kills / stats.mapStats.length).toFixed(1)}
			</div>
			<div class="flex items-center gap-1 text-lg" use:tippy={{ content: 'Deaths' }}>
				<Skull />
				{(stats.deaths / stats.mapStats.length).toFixed(1)}
			</div>
			<div class="flex items-center gap-1 text-lg" use:tippy={{ content: 'Assists' }}>
				<Handshake />
				{(stats.assists / stats.mapStats.length).toFixed(1)}
			</div>
			<div class="flex items-center gap-1 text-lg" use:tippy={{ content: 'ADR' }}>
				<CrosshairIcon />
				{stats.rawHltv.adr.toFixed(0)}
			</div>
			<div class="flex items-center gap-1 text-lg" use:tippy={{ content: 'Rating' }}>
				<CandlestickChart />
				{stats.avg_hltvRating.toFixed(2)}
			</div>
		</div>
	</div>

	<div class="rounded-xl border p-2 px-4">
		{#key filteredTimeline}
			<div class="w-full grow">
				<HltvTimeline timeline={filteredTimeline} />
			</div>
		{/key}
		<div class="flex gap-2">
			<Button
				variant={duration === 'all' ? 'secondary' : 'outline'}
				onclick={() => (duration = 'all')}>All</Button
			>
			<Button
				variant={duration === '90d' ? 'secondary' : 'outline'}
				onclick={() => (duration = '90d')}>90d</Button
			>
			<Button
				variant={duration === '30d' ? 'secondary' : 'outline'}
				onclick={() => (duration = '30d')}>30d</Button
			>
			<Button
				variant={duration === '14d' ? 'secondary' : 'outline'}
				onclick={() => (duration = '14d')}>14d</Button
			>
			<Button
				variant={duration === '7d' ? 'secondary' : 'outline'}
				onclick={() => (duration = '7d')}>7d</Button
			>
			<Button
				variant={duration === '1d' ? 'secondary' : 'outline'}
				onclick={() => (duration = '1d')}>1d</Button
			>
		</div>
	</div>
	<div class="rounded-xl border p-2 px-4">
		{#key [matches, interval]}
			<div class="w-full grow">
				<HltvGroupings matchData={matches} {interval} />
			</div>
		{/key}
		<div class="flex gap-2">
			<Input
				step=".01"
				min="0.01"
				max="2"
				type="email"
				placeholder="Interval"
				class="w-20"
				bind:value={intervalInput}
			/>
			<Button type="submit" onclick={() => (interval = parseFloat(intervalInput))}>Set</Button>
		</div>
	</div>
	<div class="flex flex-col-reverse gap-4 md:flex-row">
		<div class="flex flex-col gap-2">
			<div class="flex justify-between gap-2">
				<Select.Root type="single" bind:value={mapFilter}>
					<Select.Trigger class="w-[140px]"
						>{mapFilter === 'all' ? 'Select Map' : getMapString(mapFilter)}</Select.Trigger
					>
					<Select.Content>
						<Select.Item value="all">All</Select.Item>
						{#each Array.from(new Set(stats.mapStats.map((x) => x.map))).sort() as map}
							<Select.Item value={map}>{getMapString(map)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<div class="flex gap-2">
					<Select.Root type="single" bind:value={sortedBy}>
						<Select.Trigger class="w-[140px]"
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
						onclick={() => (sortDirection = sortDirection === 'asc' ? 'desc' : 'asc')}
					>
						{#if sortDirection === 'asc'}
							<ArrowUp />
						{:else}
							<ArrowDown />
						{/if}
					</Button>
				</div>
			</div>
			<div class="flex w-fit flex-col items-center justify-center gap-4">
				{#each matches as match}
					<div class="flex flex-col items-center justify-center gap-4">
						<button onclick={() => goto(`/matches/${match.matchId}`)}>
							<div
								class="w-96 grow rounded-lg border p-4 md:p-4"
								style={`background-image: linear-gradient(rgba(0, 0, 0, 0.4), ${match.didPlayerWin ? 'rgba(20, 83, 45, 0.7)' : 'rgba(127, 29, 29, 0.7)'}), url('/maps/${match.map}.webp');background-size: cover; background-position: center;`}
							>
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between gap-2 text-left text-sm">
										<div class="flex flex-col">
											<div>{dayjs(match.timestamp * 1000).format('Do MMM YYYY HH:mm')}</div>
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
										<div class="flex w-32 items-center justify-end gap-2 text-lg md:w-32"></div>
										<div
											class="flex w-32 items-center gap-1 text-lg"
											use:tippy={{ content: 'ADR' }}
										>
											<CrosshairIcon />
											{match.rawHltv.adr.toFixed(0)}
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
			<MapTable data={maps} columns={basicColumns} />
			{#key duelStats}
				<DuelTable data={duelStats} columns={duelColumns} />
			{/key}
		</div>
	</div>
</div>
