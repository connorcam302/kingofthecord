<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import play from 'lucide-svelte/icons/play';
	import { Ban } from 'lucide-svelte';

	let { data } = $props();

	const { playerStats } = data;

	let playerList = $state(playerStats.sort((a, b) => a.name.localeCompare(b.name)));

	let pool = $derived(
		playerStats
			.filter(
				(player) => !playerList.some((listedPlayer) => listedPlayer.steamid === player.steamid)
			)
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let team1 = $state([]);
	let team2 = $state([]);

	const updatePool = (player: any, action: string) => {
		if (action === 'add') {
			if (pool.length < 10) {
				playerList = playerList
					.filter((x) => x !== player)
					.sort((a, b) => a.name.localeCompare(b.name));
			} else {
				toast('Could not add player.', {
					description: 'You can only have 10 players in the pool.',
					icon: Ban
				});
			}
		}

		if (action === 'remove') {
			playerList = [...playerList, player].sort((a, b) => a.name.localeCompare(b.name));
		}
	};

	const makeTeams = () => {
		if (pool.length < 10) {
			toast('Could not make teams.', {
				description: 'You must have 10 players in the pool.',
				icon: Ban
			});
		} else {
			const playerPool = $derived(pool.slice().sort((a, b) => a.avg_hltvRating - b.avg_hltvRating));
			team1 = [playerPool[0]];
			for (let i = 1; i < pool.length; i++) {
				console.log('adding', playerPool[i]);
				if (team1.length < 5) {
					if (
						team1.reduce((a, b) => a + b.avg_hltvRating, 0) <
						team2.reduce((a, b) => a + b.avg_hltvRating, 0)
					) {
						console.log('adding to team 1');
						team1.push(playerPool[i]);
					} else {
						console.log('adding to team 2');
						team2.push(playerPool[i]);
					}
				} else {
					team2.push(playerPool[i]);
				}
			}
		}
		console.log(team1, team2);
	};
</script>

<svelte:head>
	<title>Team Builder</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-4">
	<div
		class="flex w-full max-w-screen-sm flex-row items-center gap-2 overflow-auto rounded-xl border px-1 py-2"
	>
		{#each playerList as player}
			<div class="flex items-center gap-2">
				<Button variant="outline" class="text-xl" onclick={() => updatePool(player, 'add')}
					>{player.name}</Button
				>
			</div>
		{/each}
	</div>
	<div class="grid h-64 grid-cols-2 gap-2">
		{#each pool as player}
			<div class="h-fit">
				<Button onclick={() => updatePool(player, 'remove')} variant="outline">
					<div class="flex w-48 items-center justify-between gap-2 text-lg">
						<div class="w-40 truncate text-left">{player.name}</div>
						<div>{player.avg_hltvRating.toFixed(2)}</div>
					</div></Button
				>
			</div>
		{/each}
	</div>
	<div>
		<Button variant="outline" class="text-xl" onclick={() => makeTeams()}>Make Teams</Button>
	</div>
	{#if team1.length > 0 && team2.length > 0}
		<div class="flex items-center justify-center gap-4">
			<div class="flex flex-col items-center justify-center gap-2">
				<div class="flex w-full justify-between">
					<div class="text-2xl">Team 1</div>
					<div class="text-2xl">
						{team1.reduce((a, b) => a + b.avg_hltvRating, 0).toFixed(2)}
					</div>
				</div>
				{#each team1 as player}
					<Button onclick={() => updatePool(player, 'remove')} variant="outline">
						<div class="flex w-48 items-center justify-between gap-2 text-lg">
							<div class="w-40 truncate text-left">{player.name}</div>
							<div>{player.avg_hltvRating.toFixed(2)}</div>
						</div>
					</Button>
				{/each}
			</div>
			<div class="flex flex-col items-center justify-center gap-2">
				<div class="flex w-full justify-between">
					<div class="text-2xl">
						{team2.reduce((a, b) => a + b.avg_hltvRating, 0).toFixed(2)}
					</div>
					<div class="text-2xl">Team 2</div>
				</div>
				{#each team2 as player}
					<Button onclick={() => updatePool(player, 'remove')} variant="outline">
						<div class="flex w-48 items-center justify-between gap-2 text-lg">
							<div class="w-40 truncate text-left">{player.name}</div>
							<div>{player.avg_hltvRating.toFixed(2)}</div>
						</div>
					</Button>
				{/each}
			</div>
		</div>
	{/if}
</div>
