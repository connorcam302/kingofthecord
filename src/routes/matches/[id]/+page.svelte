<script lang="ts">
	import DataTable from './data-table.svelte';
	import { basicColumns, advancedColumns } from './columns.js';
	import { Button } from '$lib/components/ui/button';
	import { getMapString } from '$lib/utils';
	import dayjs from 'dayjs';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { matchData, matchId }: { matchData } = data;

	const teamOne = matchData.playerStats[0].team_number;
	const teamTwo = matchData.playerStats.filter((x: any) => x.team_number !== teamOne)[0]
		.team_number;
	console.log(matchData);

	let firstTab = $state('basic');
	let selectedRound = $state(matchData.rounds[0]);
	let selectedPlayer = $state(matchData.playerStats[0].player_id);

	const ticksToMMSS = (ticks: number) => {
		return (
			('00' + Math.floor(ticks / 64 / 60)).slice(-2) +
			':' +
			('00' + (Math.floor(ticks / 64) % 60)).slice(-2)
		);
	};

	$effect(() => {
		console.log(selectedRound);
	});
</script>

<div class="mx-auto flex max-w-screen-xl flex-col gap-4 px-1">
	<div
		class="grow rounded-lg border p-4 md:p-4"
		style={`background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/maps/${matchData.lobbyInfo.map_name}.webp');background-size: cover; background-position: center;`}
	>
		<div class="flex flex-col items-center gap-2">
			<div class="flex items-center justify-center gap-2">
				<div class="flex items-center justify-center gap-4">
					<div class="text-xl">Team 1</div>
					<div class="text-4xl">{matchData.rounds[matchData.rounds.length - 1].teamOneScore}</div>
				</div>
				<div class="text-2xl">-</div>
				<div class="flex items-center justify-center gap-4">
					<div class="text-4xl">{matchData.rounds[matchData.rounds.length - 1].teamTwoScore}</div>
					<div class="text-xl">Team 2</div>
				</div>
			</div>
			<div class="text-lg">{getMapString(matchData.lobbyInfo.map_name)}</div>
			<div class="flex flex-col items-center justify-center gap-1">
				<div>{dayjs(matchData.lobbyInfo.timestamp * 1000).toString()}</div>
				<div>
					{ticksToMMSS(matchData.rounds[matchData.rounds.length - 1].start)}
				</div>
			</div>
		</div>
	</div>
	<div class="rounded-lg border pt-4 md:p-4">
		<div class="flex flex-col gap-4 px-1">
			<div class="flex gap-2">
				<Button
					variant={firstTab === 'basic' ? 'secondary' : 'outline'}
					onclick={() => (firstTab = 'basic')}>Basic</Button
				>
				<Button
					variant={firstTab === 'advanced' ? 'secondary' : 'outline'}
					onclick={() => (firstTab = 'advanced')}>Advanced</Button
				>
			</div>
			{#await matchData}
				<p>...Waiting</p>
			{:then matchData}
				{#if firstTab === 'basic'}
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-2">
							<div class="text-lg">Team 1</div>
							<DataTable
								data={matchData.playerStats.filter((x) => x.team_number === teamOne)}
								columns={basicColumns}
							/>
						</div>
						<div class="flex flex-col gap-2">
							<div>Team 2</div>
							<DataTable
								data={matchData.playerStats.filter((x) => x.team_number === teamTwo)}
								columns={basicColumns}
							/>
						</div>
					</div>
				{:else if firstTab === 'advanced'}
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
			<div class="mx-auto flex flex-col gap-4 rounded-md border p-4">
				<div
					class="flex max-w-[350px] gap-1 overflow-auto sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg"
				>
					<div class="flex flex-col gap-1 pr-2 text-lg">
						<div class="flex h-8 w-16 items-center">Team 1</div>
						<div class="flex h-8 w-16 items-center">Team 2</div>
					</div>
					{#key selectedRound}
						{#each matchData.rounds.slice(0, matchData.rounds.length - 1) as round, i}
							{#if i < 13}
								<button
									class={`flex flex-col gap-1 rounded-lg transition-colors duration-150 ${
										selectedRound.round === i + 1 ? 'bg-slate-800' : 'hover:bg-slate-800'
									}`}
									onclick={() => (selectedRound = round)}
								>
									{#if round.winner === 'teamOne'}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-t-lg bg-yellow-800"
										>
											{round.teamOneScore + (round.winner === 'teamOne' ? 1 : 0)}
										</div>
									{:else}
										<div class="flex h-8 w-8 items-end justify-center">
											<div class="flex h-2 w-8 rounded-t-lg bg-yellow-800"></div>
										</div>
									{/if}
									{#if round.winner === 'teamTwo'}
										<div class="flex h-8 w-8 items-center justify-center rounded-b-lg bg-sky-800">
											{round.teamTwoScore + (round.winner === 'teamTwo' ? 1 : 0)}
										</div>
									{:else}
										<div class="flex h-8 w-8 items-start justify-center">
											<div class="flex h-2 w-8 rounded-b-lg bg-sky-800"></div>
										</div>
									{/if}
								</button>
							{:else}
								<button
									class={`flex flex-col gap-1 rounded-lg transition-colors duration-150 ${
										selectedRound.round === i + 1 ? 'bg-slate-800' : 'hover:bg-slate-800'
									}`}
									onclick={() => (selectedRound = round)}
								>
									{#if round.winner === 'teamOne'}
										<div class="flex h-8 w-8 items-center justify-center rounded-t-lg bg-sky-800">
											{round.teamOneScore + (round.winner === 'teamOne' ? 1 : 0)}
										</div>
									{:else}
										<div class="flex h-8 w-8 items-end justify-center">
											<div class="flex h-2 w-8 rounded-t-lg bg-sky-800"></div>
										</div>
									{/if}
									{#if round.winner === 'teamTwo'}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-b-lg bg-yellow-800"
										>
											{round.teamTwoScore + (round.winner === 'teamTwo' ? 1 : 0)}
										</div>
									{:else}
										<div class="flex h-8 w-8 items-start justify-center">
											<div class="flex h-2 w-8 rounded-b-lg bg-yellow-800"></div>
										</div>
									{/if}
								</button>
							{/if}
						{/each}
					{/key}
				</div>
				<div class="text-2xl">Round {selectedRound.round}</div>
				<div class="flex justify-between">
					<div class="flex flex-col gap-2 rounded-md border">
						<table>
							<thead>
								<tr>
									<th></th>
									<th class="px-2">Kills</th>
									<th class="px-2">Damage</th>
									<th class="px-2">Tagged</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedRound.damage.filter((x) => x.team === teamOne) as player}
									<tr class="border-y px-2">
										<td>{player.attacker_name}</td>
										<td class="text-center"
											>{player.damage_dealt.filter((entry) => entry.killed === true).length}</td
										>
										<td class="text-center">
											{player.damage_dealt.reduce((sum, entry) => sum + entry.damage, 0)}
										</td>
										<td class="text-center">
											{new Set(
												player.damage_dealt
													.filter((entry) => entry.damage > 0)
													.map((entry) => entry.defender)
											).size}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
