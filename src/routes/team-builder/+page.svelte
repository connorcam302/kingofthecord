<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import play from 'lucide-svelte/icons/play';
	import { Ban, Check, SearchIcon } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { data } = $props();

	const { playerStats } = data;

	let playerList = $state(playerStats.sort((a, b) => a.name.localeCompare(b.name)));
	let extraPlayers = $state([]);

	let pool = $derived(
		playerStats
			.filter(
				(player) => !playerList.some((listedPlayer) => listedPlayer.steamid === player.steamid)
			)
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let team1 = $state([]);
	let team2 = $state([]);

	let open = false;
	let newPlayerName = $state('');
	let newPlayerRating = $state();

	const addPlayer = (name: string, rating: number) => {
		console.log(name, rating);
		extraPlayers = [...extraPlayers, { name: name, avg_hltvRating: rating }];
	};

	let searchText = $state('');
	const filterPlayers = () => {
		if (searchText !== '') {
			console.log('filtering on:', searchText);
			playerList = playerStats
				.filter((player) => player.name.toLowerCase().includes(searchText.toLowerCase()))
				.sort((a, b) => a.name.localeCompare(b.name));
			console.log(playerList);
		} else {
			playerList = playerStats.sort((a, b) => a.name.localeCompare(b.name));
		}
	};

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
		team1 = [];
		team2 = [];

		if (pool.length < 10) {
			toast('Could not make teams.', {
				description: 'You must have 10 players in the pool.',
				icon: Ban
			});

			return;
		} else {
			const saltPool = (pool) => {
				return pool.map((player) => {
					// Generate a random salt within ±10% of avg_hltvRating
					const salt = player.avg_hltvRating * (Math.random() * 0.2 - 0.1); // Random number between -10% and +10%
					return {
						...player,
						salted_avg_hltvRating: player.avg_hltvRating + salt, // Add salt to avg_hltvRating
						salt: salt // Store the exact salt value used
					};
				});
			};

			const playerPool = $derived(
				saltPool(pool.slice()).sort((a, b) => b.salted_avg_hltvRating - a.salted_avg_hltvRating)
			);
			team1 = [playerPool[0]];
			for (let i = 1; i < pool.length; i++) {
				if (i % 2 === 0) {
					team1.push(playerPool[i]);
				} else {
					team2.push(playerPool[i]);
				}
			}
		}

		for (let i = 0; i < team1.length; i++) {
			for (let j = 0; j < team2.length; j++) {
				const team1hltv = team1.reduce((a, b) => a + b.salted_avg_hltvRating, 0);
				const team2hltv = team2.reduce((a, b) => a + b.salted_avg_hltvRating, 0);

				const hltvDiff = Math.abs(team1hltv - team2hltv);

				const player1 = team1[i];
				const player2 = team2[j];

				const team1Swap = [...team1.filter((x) => x !== player1), player2];
				const team2Swap = [...team2.filter((x) => x !== player2), player1];

				const team1SwapHltv = team1Swap.reduce((a, b) => a + b.salted_avg_hltvRating, 0);
				const team2SwapHltv = team2Swap.reduce((a, b) => a + b.salted_avg_hltvRating, 0);

				const swapHltvDiff = Math.abs(team1SwapHltv - team2SwapHltv);

				if (swapHltvDiff < hltvDiff) {
					team1[i] = player2;
					team2[j] = player1;
				}
			}
		}

		toast('Could not make teams.', {
			description: 'Teams were successfully generated.',
			icon: Check
		});
	};

	$effect(() => {
		console.log(pool);
		console.log(playerList);
		console.log(extraPlayers);
	});
</script>

<svelte:head>
	<title>Team Builder</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-4">
	<div class="flex w-full grow items-center gap-2 text-xl">
		<SearchIcon size={40} />
		<div class="grow">
			<Input
				class="text-xl"
				placeholder="Search..."
				bind:value={searchText}
				oninput={() => filterPlayers()}
			/>
		</div>
	</div>
	<div class="flex gap-2">
		<div
			class="flex w-full max-w-screen-sm grow flex-row items-center gap-2 overflow-auto rounded-xl border px-1 py-2"
		>
			{#each playerList as player}
				<div class="flex items-center gap-2">
					<Button variant="outline" class="text-xl" onclick={() => updatePool(player, 'add')}
						>{player.name}</Button
					>
				</div>
			{/each}
		</div>
		<div>
			<Button variant="outline" class="h-full rounded-lg border text-lg">Create Player</Button>
		</div>
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

<Drawer.Root bind:open>
	<Drawer.Trigger class={buttonVariants({ variant: 'outline' })}>Edit Profile</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header class="text-left">
			<Drawer.Title>Create Player</Drawer.Title>
			<Drawer.Description>Manually Create a Player by name and Rating.</Drawer.Description>
		</Drawer.Header>
		<form class="grid items-start gap-4 px-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input type="text" id="name" placeholder="Name" bind:value={newPlayerName} />
			</div>
			<div class="grid gap-2">
				<Label for="rating">Rating</Label>
				<Input id="rating" type="number" placeholder="0-5" bind:value={newPlayerRating} />
			</div>
			<Button type="submit" onclick={() => addPlayer(newPlayerName, newPlayerRating)}
				>Add Player</Button
			>
		</form>
		<Drawer.Footer class="pt-2">
			<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
