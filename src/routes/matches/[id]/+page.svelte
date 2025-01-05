<script lang="ts">
	import DataTable from './data-table.svelte';
	import { basicColumns, advancedColumns } from './columns.js';
	import { Button } from '$lib/components/ui/button';
	import { getMapString } from '$lib/utils';
	import dayjs from 'dayjs';
	import { LocateOff, Locate, ChevronUpIcon, ChevronDownIcon, Crosshair } from 'lucide-svelte';
	import tippy from 'sveltejs-tippy';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { matchData, matchId }: { matchData } = data;

	const teamOne = matchData.playerStats[0].team_number;
	const teamTwo = matchData.playerStats.filter((x: any) => x.team_number !== teamOne)[0]
		.team_number;

	let firstTab = $state('basic');
	let selectedRound = $state(matchData.rounds[0]);
	let selectedPlayer = $state(matchData.rounds[0].damage[0]);
	let selectedTimeline = $state(matchData.rounds[0].damage[0].damage_dealt[0]);

	const changeSelectedPlayer = (player: any) => {
		selectedPlayer = player;
	};

	const ticksToMMSS = (ticks: number) => {
		return (
			('00' + Math.floor(ticks / 64 / 60)).slice(-2) +
			':' +
			('00' + (Math.floor(ticks / 64) % 60)).slice(-2)
		);
	};

	let duelPlayer1 = $state(matchData.playerStats[0]);
	let duelPlayer2 = $state(matchData.playerStats.filter((x: any) => x.team_number !== teamOne)[0]);
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
		</div>
	</div>

	<div class="mx-auto flex flex-col gap-4 rounded-lg border p-1 md:p-4">
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
							onclick={() => {
								selectedRound = round;
								selectedPlayer = round.damage.find(
									(x) => x.attacker_name === selectedPlayer.attacker_name
								);
								selectedTimeline = selectedPlayer.damage_dealt[0];
							}}
						>
							{#if round.winner === 'teamOne'}
								<div class="flex h-8 w-8 items-center justify-center rounded-t-lg bg-yellow-800">
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
							onclick={() => {
								selectedRound = round;
								selectedPlayer = round.damage[0];
								selectedTimeline = selectedPlayer.damage_dealt[0];
							}}
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
								<div class="flex h-8 w-8 items-center justify-center rounded-b-lg bg-yellow-800">
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
		<div class="flex flex-wrap justify-center gap-2">
			<div class="flex flex-col gap-2 rounded-md border">
				<table>
					<thead>
						<tr>
							<th></th>
							<th class="px-2 py-1">Kills</th>
							<th class="px-2">Damage</th>
							<th class="px-2">Tagged</th>
						</tr>
					</thead>
					<tbody>
						<tr class="border-y px-2">
							<td colspan="4" class="py-1 pl-2 text-center">Team 1</td>
						</tr>
						{#each selectedRound.damage
							.filter((x) => x.team === teamOne)
							.sort((a, b) => b.damage_dealt.filter((entry) => entry.killed === true).length - a.damage_dealt.filter((entry) => entry.killed === true).length || b.damage_dealt.reduce((sum, entry) => sum + entry.damage, 0) - a.damage_dealt.reduce((sum, entry) => sum + entry.damage, 0)) as player, i}
							{#if selectedPlayer.attacker_steamid === player.attacker_steamid}
								<tr
									class="border-y bg-slate-900 px-2 transition-colors hover:cursor-pointer data-[state=selected]:bg-muted"
									onclick={() => {
										selectedPlayer = player;
										selectedTimeline = selectedPlayer.damage_dealt[0];
									}}
								>
									<td class="py-1 pl-2">{player.attacker_name}</td>
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
							{:else}
								<tr
									class="border-y px-2 transition-colors hover:cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted"
									onclick={() => {
										selectedPlayer = player;
										selectedTimeline = selectedPlayer.damage_dealt[0];
									}}
								>
									<td class="py-1 pl-2">{player.attacker_name}</td>
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
							{/if}
						{/each}
						<tr class="border-y px-2">
							<td colspan="4" class="py-1 pl-2 text-center">Team 2</td>
						</tr>
						{#each selectedRound.damage.filter((x) => x.team === teamTwo) as player, i}
							{#if selectedPlayer.attacker_steamid === player.attacker_steamid}
								<tr
									class="border-y bg-slate-900 px-2 transition-colors hover:cursor-pointer data-[state=selected]:bg-muted"
									onclick={() => {
										selectedPlayer = player;
										selectedTimeline = selectedPlayer.damage_dealt[0];
									}}
								>
									<td class="py-1 pl-2">{player.attacker_name}</td>
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
							{:else}
								<tr
									class="border-y px-2 transition-colors hover:cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted"
									onclick={() => {
										selectedPlayer = player;
										selectedTimeline = selectedPlayer.damage_dealt[0];
									}}
								>
									<td class="py-1 pl-2">{player.attacker_name}</td>
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
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
			<div class="h-full grow">
				<div class="flex flex-col gap-2 rounded-md border p-2">
					<div class="text-xl">{selectedPlayer.attacker_name}</div>
					<div class="flex flex-col gap-2">
						{#each selectedPlayer.damage_dealt as entry}
							{#if selectedTimeline.defender !== entry.defender}
								<button
									onclick={() => (selectedTimeline = entry)}
									class="rounded-md border p-2 transition-colors hover:bg-slate-900"
								>
									<div class="flex h-24 flex-col items-start gap-2">
										<div class="flex justify-between">
											<div>{entry.defenderName}</div>
										</div>
										<div class="flex gap-2">
											{#if entry.killed}
												<div><Locate /></div>
											{:else}
												<div class="opacity-50"><LocateOff /></div>
											{/if}
											<div>{entry.damage}</div>
										</div>
										<div class="flex gap-4">
											{#each Object.entries(entry.events
													.filter((event) => event.event_name !== 'player_death')
													.reduce((acc, event) => {
														// Group by weapon
														if (!acc[event.weapon]) {
															acc[event.weapon] = { totalDamage: 0, count: 0 };
														}
														acc[event.weapon].totalDamage += event.dmg_health;
														acc[event.weapon].count += 1;
														return acc;
													}, {}))
												.sort((a, b) => b[1].totalDamage - a[1].totalDamage)
												.slice(0, 4) as [weapon, stats], i}
												{#if i < 4}
													<div class="flex items-center gap-2">
														<div class="flex items-center gap-1 rounded-sm border pr-1">
															<img
																src={`/weapons/weapon_${weapon}.svg`}
																alt={weapon}
																class="h-8 w-8"
															/>
															<span>{stats.totalDamage}</span>
														</div>
														<span>x {stats.count}</span>
													</div>
												{:else}
													<div class="flex items-center gap-2">
														<div class="text-xl">
															+ {Object.entries(
																entry.events
																	.filter((event) => event.event_name !== 'player_death')
																	.reduce((acc, event) => {
																		// Group by weapon
																		if (!acc[event.weapon]) {
																			acc[event.weapon] = { totalDamage: 0, count: 0 };
																		}
																		acc[event.weapon].totalDamage += event.dmg_health;
																		acc[event.weapon].count += 1;
																		return acc;
																	}, {})
															).length - 3}
														</div>
													</div>
												{/if}
											{/each}
										</div>
									</div>
								</button>
							{:else}
								<button
									onclick={() => (selectedTimeline = entry)}
									class="rounded-md border bg-slate-900 p-2 transition-colors"
								>
									<div class="flex h-24 flex-col items-start gap-2">
										<div class="flex justify-between">
											<div>{entry.defenderName}</div>
										</div>
										<div class="flex gap-2">
											{#if entry.killed}
												<div><Locate /></div>
											{:else}
												<div class="opacity-50"><LocateOff /></div>
											{/if}
											<div>{entry.damage}</div>
										</div>
										<div class="flex gap-4">
											{#each Object.entries(entry.events
													.filter((event) => event.event_name !== 'player_death')
													.reduce((acc, event) => {
														// Group by weapon
														if (!acc[event.weapon]) {
															acc[event.weapon] = { totalDamage: 0, count: 0 };
														}
														acc[event.weapon].totalDamage += event.dmg_health;
														acc[event.weapon].count += 1;
														return acc;
													}, {}))
												.sort((a, b) => b[1].totalDamage - a[1].totalDamage)
												.slice(0, 4) as [weapon, stats], i}
												{#if i < 4}
													<div class="flex items-center gap-2">
														<div class="flex items-center gap-1 rounded-sm border pr-1">
															<img
																src={`/weapons/weapon_${weapon}.svg`}
																alt={weapon}
																class="h-8 w-8"
															/>
															<span>{stats.totalDamage}</span>
														</div>
														<span>x {stats.count}</span>
													</div>
												{:else}
													<div class="flex items-center gap-2">
														<div class="text-xl">
															+ {Object.entries(
																entry.events
																	.filter((event) => event.event_name !== 'player_death')
																	.reduce((acc, event) => {
																		// Group by weapon
																		if (!acc[event.weapon]) {
																			acc[event.weapon] = { totalDamage: 0, count: 0 };
																		}
																		acc[event.weapon].totalDamage += event.dmg_health;
																		acc[event.weapon].count += 1;
																		return acc;
																	}, {})
															).length - 3}
														</div>
													</div>
												{/if}
											{/each}
										</div>
									</div>
								</button>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-2 rounded-md border p-1 md:p-4">
			<div class="flex flex-wrap justify-between">
				<div class="flex w-full flex-col gap-2 md:w-[45%]">
					<div class="text-lg">{selectedTimeline.defenderName}</div>
					{#if selectedTimeline.events.length > 0}
						<div class="flex gap-2">
							{#if selectedTimeline.events[selectedTimeline.events.length - 1].event_name !== 'player_death'}
								<div
									class="flex items-center justify-center gap-1 rounded-sm bg-white pr-1 text-center text-zinc-900"
									style="width: {100 -
										selectedTimeline.events
											.filter((event) => event.event_name !== 'player_death')
											.reduce((acc, event) => acc + event.dmg_health, 0)}%"
									use:tippy={{
										content: `Remaining Health`,
										placement: 'bottom',
										theme: 'dark',
										allowHTML: true
									}}
								>
									{100 -
										selectedTimeline.events
											.filter((event) => event.event_name !== 'player_death')
											.reduce((acc, event) => acc + event.dmg_health, 0)}
								</div>
							{/if}
							{#each selectedTimeline.events.filter((event, i, arr) => event.event_name !== 'player_death') as event, i}
								{#if selectedTimeline.events[i + 1]?.event_name !== 'player_death'}
									<div
										class="flex flex-none items-center justify-center gap-1 rounded-sm border pr-1"
										style="width: {event.dmg_health}%"
										use:tippy={{
											content: `
			<div class='flex gap-2 items-center'>
				<img
					src=${`/weapons/weapon_${event.weapon}.svg`}
					alt=${event.weapon}
					class="h-8 w-8"
				/>
				${
					event.hitgroup === 'head'
						? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair">
					<circle cx="12" cy="12" r="10"/>
					<line x1="22" x2="18" y1="12" y2="12"/>
					<line x1="6" x2="2" y1="12" y2="12"/>
					<line x1="12" x2="12" y1="6" y2="2"/>
					<line x1="12" x2="12" y1="22" y2="18"/>
				</svg>`
						: ''
				}
			</div>
		`,
											placement: 'bottom',
											theme: 'dark',
											allowHTML: true
										}}
									>
										<span class="text-sm">{event.dmg_health}</span>
									</div>
								{:else}
									<div
										class="flex grow items-center justify-center gap-1 rounded-sm border bg-red-800 pr-1"
										use:tippy={{
											content: `
			<div class='flex gap-2 items-center'>
				<img
					src=${`/weapons/weapon_${event.weapon}.svg`}
					alt=${event.weapon}
					class="h-8 w-8"
				/>
				${
					event.hitgroup === 'head'
						? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair">
					<circle cx="12" cy="12" r="10"/>
					<line x1="22" x2="18" y1="12" y2="12"/>
					<line x1="6" x2="2" y1="12" y2="12"/>
					<line x1="12" x2="12" y1="6" y2="2"/>
					<line x1="12" x2="12" y1="22" y2="18"/>
				</svg>`
						: ''
				}
			</div>
		`,
											placement: 'bottom',
											theme: 'dark',
											allowHTML: true
										}}
									>
										<span
											>{selectedTimeline.events
												.filter((event) => event.event_name !== 'player_death')
												.reduce((acc, event) => acc + event.dmg_health, 0)}</span
										>
									</div>
								{/if}
							{/each}
						</div>
					{:else}
						<div
							class="flex items-center justify-center gap-1 rounded-sm bg-white pr-1 text-center text-zinc-900"
							style="width: 100%"
							use:tippy={{
								content: `Remaining Health`,
								placement: 'bottom',
								theme: 'dark',
								allowHTML: true
							}}
						>
							{100}
						</div>
					{/if}
				</div>
				<div class="flex w-full flex-col gap-2 md:w-[45%]">
					<div class="text-right text-lg">{selectedPlayer.attacker_name}</div>
					{#if selectedRound.damage
						.find((x) => x.attacker_name === selectedTimeline.defenderName)
						?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)?.events?.length > 0}
						<div class="flex gap-2">
							{#each selectedRound.damage
								.find((x) => x.attacker_name === selectedTimeline.defenderName)
								?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)
								?.events.filter((event) => event.event_name !== 'player_death') as event, i}
								{#if selectedRound.damage
									.find((x) => x.attacker_name === selectedTimeline.defenderName)
									?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)?.events[i + 1]?.event_name !== 'player_death'}
									<div
										class="flex flex-none items-center justify-center gap-1 rounded-sm border pr-1"
										style="width: {event.dmg_health}%"
										use:tippy={{
											content: `
			<div class='flex gap-2 items-center'>
				<img
					src=${`/weapons/weapon_${event.weapon}.svg`}
					alt=${event.weapon}
					class="h-8 w-8"
				/>
				${
					event.hitgroup === 'head'
						? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair">
					<circle cx="12" cy="12" r="10"/>
					<line x1="22" x2="18" y1="12" y2="12"/>
					<line x1="6" x2="2" y1="12" y2="12"/>
					<line x1="12" x2="12" y1="6" y2="2"/>
					<line x1="12" x2="12" y1="22" y2="18"/>
				</svg>`
						: ''
				}
			</div>
		`,

											placement: 'bottom',
											theme: 'dark',
											allowHTML: true
										}}
									>
										<span class="text-sm">{event.dmg_health}</span>
									</div>
								{:else}
									<div
										class="flex grow items-center justify-center gap-1 rounded-sm border bg-red-800 pr-1"
										use:tippy={{
											content: `
			<div class='flex gap-2 items-center'>
				<img
					src=${`/weapons/weapon_${event.weapon}.svg`}
					alt=${event.weapon}
					class="h-8 w-8"
				/>
				${
					event.hitgroup === 'head'
						? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair">
					<circle cx="12" cy="12" r="10"/>
					<line x1="22" x2="18" y1="12" y2="12"/>
					<line x1="6" x2="2" y1="12" y2="12"/>
					<line x1="12" x2="12" y1="6" y2="2"/>
					<line x1="12" x2="12" y1="22" y2="18"/>
				</svg>`
						: ''
				}
			</div>
		`,
											placement: 'bottom',
											theme: 'dark',
											allowHTML: true
										}}
									>
										<span
											>{selectedRound.damage
												.find((x) => x.attacker_name === selectedTimeline.defenderName)
												?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)
												?.events.filter((event) => event.event_name !== 'player_death')
												.reduce((acc, event) => acc + event.dmg_health, 0)}</span
										>
									</div>
								{/if}
							{/each}
							{#if selectedRound.damage
								.find((x) => x.attacker_name === selectedTimeline.defenderName)
								?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)?.events[selectedRound.damage
									.find((x) => x.attacker_name === selectedTimeline.defenderName)
									?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)?.events.length - 1].event_name !== 'player_death'}
								<div
									class="flex items-center justify-center gap-1 rounded-sm bg-white pr-1 text-center text-zinc-900"
									style="width: {100 -
										selectedRound.damage
											.find((x) => x.attacker_name === selectedTimeline.defenderName)
											?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)
											?.events.filter((event) => event.event_name !== 'player_death')
											.reduce((acc, event) => acc + event.dmg_health, 0)}%"
									use:tippy={{
										content: `Remaining Health`,
										placement: 'bottom',
										theme: 'dark',
										allowHTML: true
									}}
								>
									{100 -
										selectedRound.damage
											.find((x) => x.attacker_name === selectedTimeline.defenderName)
											?.damage_dealt.find((x) => x.defender === selectedPlayer.attacker_steamid)
											?.events.filter((event) => event.event_name !== 'player_death')
											.reduce((acc, event) => acc + event.dmg_health, 0)}
								</div>
							{/if}
						</div>
					{:else}
						<div
							class="flex items-center justify-center gap-1 rounded-sm bg-white pr-1 text-center text-zinc-900"
							style="width: 100%"
							use:tippy={{
								content: `Remaining Health`,
								placement: 'bottom',
								theme: 'dark',
								allowHTML: true
							}}
						>
							{100}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="mx-auto flex max-w-screen-xl grow flex-col gap-4 rounded-xl border">
		<div class="flex flex-col gap-2">
			<div class="px-2 text-2xl">Duels</div>
			<div class="margin flex flex-wrap rounded-lg">
				<div class="flex flex-col">
					{#each matchData.playerStats.filter((x) => x.team_number === teamOne) as player, i}
						{#if duelPlayer1.steamid === player.steamid}
							<button
								class="w-48 truncate border-y bg-slate-900 p-2"
								onclick={() => (duelPlayer1 = player)}>{player.name}</button
							>
						{:else}
							<button
								class="w-48 truncate border-y p-2 hover:bg-slate-900"
								onclick={() => (duelPlayer1 = player)}>{player.name}</button
							>
						{/if}
					{/each}
				</div>
				<div class="flex min-w-48 border-y">
					<div class="flex w-full flex-col">
						<div class="w-full border-x border-b py-2 text-center text-lg">Score</div>
						<div class="flex w-full justify-between border-x border-b text-lg">
							{#if matchData.rounds.reduce((count, round) => count + (round.damage
										.find((x) => x.attacker_steamid === duelPlayer1.steamid)
										?.damage_dealt.filter((x) => x.defender === duelPlayer2.steamid && x.killed).length || 0), 0) > matchData.rounds.reduce((count, round) => count + (round.damage
											.find((x) => x.attacker_steamid === duelPlayer2.steamid)
											?.damage_dealt.filter((x) => x.defender === duelPlayer1.steamid && x.killed).length || 0), 0)}<div
									class="w-1/2 bg-gradient-to-r from-green-800 pl-2"
								>
									{matchData.rounds.reduce(
										(count, round) =>
											count +
											(round.damage
												.find((x) => x.attacker_steamid === duelPlayer1.steamid)
												?.damage_dealt.filter((x) => x.defender === duelPlayer2.steamid && x.killed)
												.length || 0),
										0
									)}
								</div>
							{:else}
								<div class="w-1/2 pl-2">
									{matchData.rounds.reduce(
										(count, round) =>
											count +
											(round.damage
												.find((x) => x.attacker_steamid === duelPlayer1.steamid)
												?.damage_dealt.filter((x) => x.defender === duelPlayer2.steamid && x.killed)
												.length || 0),
										0
									)}
								</div>
							{/if}
							{#if matchData.rounds.reduce((count, round) => count + (round.damage
										.find((x) => x.attacker_steamid === duelPlayer2.steamid)
										?.damage_dealt.filter((x) => x.defender === duelPlayer1.steamid && x.killed).length || 0), 0) > matchData.rounds.reduce((count, round) => count + (round.damage
											.find((x) => x.attacker_steamid === duelPlayer1.steamid)
											?.damage_dealt.filter((x) => x.defender === duelPlayer2.steamid && x.killed).length || 0), 0)}<div
									class="w-1/2 bg-gradient-to-l from-green-800 pr-2 text-right"
								>
									{matchData.rounds.reduce(
										(count, round) =>
											count +
											(round.damage
												.find((x) => x.attacker_steamid === duelPlayer2.steamid)
												?.damage_dealt.filter((x) => x.defender === duelPlayer1.steamid && x.killed)
												.length || 0),
										0
									)}
								</div>
							{:else}
								<div class="w-1/2 pr-2 text-right">
									{matchData.rounds.reduce(
										(count, round) =>
											count +
											(round.damage
												.find((x) => x.attacker_steamid === duelPlayer2.steamid)
												?.damage_dealt.filter((x) => x.defender === duelPlayer1.steamid && x.killed)
												.length || 0),
										0
									)}
								</div>
							{/if}
						</div>
						<div class="w-full border-x border-b py-2 text-center text-lg">Round Breakdown</div>
						{#each matchData.rounds as round, i}
							{#if round.damage
								.find((x) => x.attacker_steamid === duelPlayer1.steamid)
								.damage_dealt.find((x) => x.defender === duelPlayer2.steamid).damage > 0 || round.damage
									.find((x) => x.attacker_steamid === duelPlayer2.steamid)
									.damage_dealt.find((x) => x.defender === duelPlayer1.steamid).damage > 0}
								<div
									class="flex w-full justify-between border-x border-b text-lg hover:bg-slate-900"
									use:tippy={{
										content: `Round ${i + 1}`,
										placement: 'bottom',
										theme: 'dark',
										allowHTML: true
									}}
								>
									{#if round.damage
										.find((x) => x.attacker_steamid === duelPlayer1.steamid)
										.damage_dealt.find((x) => x.defender === duelPlayer2.steamid).killed}
										<div class="w-1/2 bg-gradient-to-r from-green-800 pl-2">
											{round.damage
												.find((x) => x.attacker_steamid === duelPlayer1.steamid)
												.damage_dealt.find((x) => x.defender === duelPlayer2.steamid).damage}
										</div>
									{:else}
										<div class="w-1/2 pl-2">
											{round.damage
												.find((x) => x.attacker_steamid === duelPlayer1.steamid)
												.damage_dealt.find((x) => x.defender === duelPlayer2.steamid).damage}
										</div>
									{/if}
									{#if round.damage
										.find((x) => x.attacker_steamid === duelPlayer2.steamid)
										.damage_dealt.find((x) => x.defender === duelPlayer1.steamid).killed}
										<div class="w-1/2 bg-gradient-to-l from-green-800 pr-2 text-right">
											{round.damage
												.find((x) => x.attacker_steamid === duelPlayer2.steamid)
												.damage_dealt.find((x) => x.defender === duelPlayer1.steamid).damage}
										</div>
									{:else}
										<div class="w-1/2 pr-2 text-right">
											{round.damage
												.find((x) => x.attacker_steamid === duelPlayer2.steamid)
												.damage_dealt.find((x) => x.defender === duelPlayer1.steamid).damage}
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				</div>
				<div class="flex flex-col">
					{#each matchData.playerStats.filter((x) => x.team_number === teamTwo) as player, i}
						{#if duelPlayer2.steamid === player.steamid}
							<button
								class="w-48 truncate border-y border-l bg-slate-900 p-2"
								onclick={() => (duelPlayer2 = player)}>{player.name}</button
							>
						{:else}
							<button
								class="w-48 truncate border-y border-l p-2 hover:bg-slate-900"
								onclick={() => (duelPlayer2 = player)}>{player.name}</button
							>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
