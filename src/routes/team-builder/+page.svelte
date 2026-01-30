<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Ban, Check, SearchIcon, Plus, Users, UserPlus, Play } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';

	let { data } = $props();

	const { playerStats } = data;

	let poolSteamids = $state(new Set());
	let extraPlayers = $state<any[]>([]);
	let searchText = $state('');

	let playerList = $derived(
		[...playerStats, ...extraPlayers]
			.filter((player) => !poolSteamids.has(player.steamid))
			.filter(
				(player) =>
					searchText === '' || player.name.toLowerCase().includes(searchText.toLowerCase())
			)
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let pool = $derived(
		[...playerStats, ...extraPlayers]
			.filter((player) => poolSteamids.has(player.steamid))
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let team1 = $state([]);
	let team2 = $state([]);

	let open = $state(false);
	let newPlayerName = $state('');
	let newPlayerRating = $state();

	const addPlayer = (name: string, rating: number) => {
		const id = `custom-${Date.now()}`;
		extraPlayers = [...extraPlayers, { steamid: id, name: name, avg_hltvRating: rating }];
		open = false;
		newPlayerName = '';
		newPlayerRating = undefined;
	};

	const updatePool = (player: any, action: string) => {
		if (action === 'add') {
			if (pool.length < 10) {
				poolSteamids = new Set([...poolSteamids, player.steamid]);
			} else {
				toast('Could not add player.', {
					description: 'You can only have 10 players in the pool.',
					icon: Ban
				});
			}
		}

		if (action === 'remove') {
			const newSet = new Set(poolSteamids);
			newSet.delete(player.steamid);
			poolSteamids = newSet;
		}
	};

	const makeTeams = () => {
		team1 = [];
		team2 = [];

		if (pool.length < 10) {
			toast('Teams Generated', {
				description: 'Teams were successfully balanced.',
				icon: Check
			});

			return;
		} else {
			const saltPool = (pool) => {
				return pool.map((player) => {
					const salt = player.avg_hltvRating * (Math.random() * 0.2 - 0.1);
					return {
						...player,
						salted_avg_hltvRating: player.avg_hltvRating + salt,
						salt: salt
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

		toast('Teams Generated', {
			description: 'Teams were successfully balanced.',
			icon: Check
		});
	};
</script>

<svelte:head>
	<title>Team Builder</title>
</svelte:head>

<div class="container mx-auto max-w-6xl space-y-6 p-6">
	<div class="text-center">
		<h1 class="text-3xl font-bold">Team Builder</h1>
		<p class="mt-1 text-muted-foreground">Select 10 players to generate balanced teams</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader class="pb-3">
				<div class="flex items-center justify-between">
					<CardTitle class="flex items-center gap-2 text-xl">
						<Users size={20} />
						Available Players
					</CardTitle>
					<span class="text-sm text-muted-foreground">{playerList.length} players</span>
				</div>
			</CardHeader>
			<CardContent class="space-y-3">
				<div class="relative">
					<SearchIcon
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input class="pl-9" placeholder="Search players..." bind:value={searchText} />
				</div>
				<div class="max-h-64 space-y-1.5 overflow-y-auto pr-2">
					{#each playerList as player}
						<button
							class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
							onclick={() => updatePool(player, 'add')}
						>
							<span class="truncate font-medium">{player.name}</span>
							<span class="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
								{player.avg_hltvRating.toFixed(2)}
							</span>
						</button>
					{/each}
					{#if playerList.length === 0}
						<p class="py-8 text-center text-sm text-muted-foreground">No players found</p>
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-3">
				<div class="flex items-center justify-between">
					<CardTitle class="flex items-center gap-2 text-xl">
						<UserPlus size={20} />
						Player Pool
					</CardTitle>
					<span class="text-sm text-muted-foreground">
						{pool.length}/10
						<span
							class={pool.length === 10
								? 'text-green-500'
								: pool.length >= 5
									? 'text-yellow-500'
									: 'text-red-500'}
						>
							{pool.length === 10 ? '✓ Ready' : ''}
						</span>
					</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full transition-all duration-300 {pool.length === 10
							? 'bg-green-500'
							: pool.length >= 5
								? 'bg-yellow-500'
								: 'bg-red-500'}"
						style="width: {(pool.length / 10) * 100}%"
					></div>
				</div>
			</CardHeader>
			<CardContent class="space-y-3">
				{#if pool.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Users class="h-12 w-12 text-muted-foreground/50" />
						<p class="mt-3 text-sm text-muted-foreground">Add players from the left panel</p>
						<p class="text-xs text-muted-foreground/70">Need 10 players to generate teams</p>
					</div>
				{:else}
					<div class="max-h-80 space-y-1.5 overflow-y-auto pr-2">
						{#each pool as player}
							<button
								class="flex w-full items-center justify-between rounded-lg border bg-primary/5 px-3 py-2 text-left transition-colors hover:bg-accent"
								onclick={() => updatePool(player, 'remove')}
							>
								<span class="truncate font-medium">{player.name}</span>
								<span
									class="ml-2 rounded bg-primary/20 px-1.5 py-0.5 font-mono text-xs font-medium"
								>
									{player.avg_hltvRating.toFixed(2)}
								</span>
							</button>
						{/each}
					</div>
				{/if}
				<Drawer.Root bind:open>
					<Drawer.Trigger
						class={buttonVariants({ variant: 'outline', size: 'sm', class: 'w-full' })}
					>
						<Plus class="mr-2 h-4 w-4" />
						Create Custom Player
					</Drawer.Trigger>
					<Drawer.Content>
						<Drawer.Header class="text-left">
							<Drawer.Title>Create Player</Drawer.Title>
							<Drawer.Description>Manually create a player with a custom rating.</Drawer.Description
							>
						</Drawer.Header>
						<form
							class="grid items-start gap-4 px-4"
							onsubmit={(e) => {
								e.preventDefault();
								addPlayer(newPlayerName, newPlayerRating);
								open = false;
							}}
						>
							<div class="grid gap-2">
								<Label for="name">Name</Label>
								<Input type="text" id="name" placeholder="Player name" bind:value={newPlayerName} />
							</div>
							<div class="grid gap-2">
								<Label for="rating">Rating (0-5)</Label>
								<Input
									id="rating"
									type="number"
									placeholder="1.00"
									step="0.01"
									min="0"
									max="5"
									bind:value={newPlayerRating}
								/>
							</div>
							<Button onclick={() => addPlayer(newPlayerName, newPlayerRating)}>Add Player</Button>
						</form>
						<Drawer.Footer class="pt-2">
							<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Root>
			</CardContent>
		</Card>
	</div>

	<div class="flex justify-center">
		<Button
			size="lg"
			class="min-w-48 text-lg"
			onclick={() => makeTeams()}
			disabled={pool.length !== 10}
		>
			<Play class="mr-2 h-5 w-5" />
			Generate Teams
		</Button>
	</div>

	{#if team1.length > 0 && team2.length > 0}
		<div class="grid gap-6 lg:grid-cols-2">
			<Card class="border-primary/30">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center justify-between text-xl">
						<span class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full bg-blue-500"></span>
							Team 1
						</span>
						<span class="text-2xl font-bold"
							>{team1.reduce((a, b) => a + b.avg_hltvRating, 0).toFixed(2)}</span
						>
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-1.5">
					{#each team1 as player}
						<div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
							<span class="truncate font-medium">{player.name}</span>
							<span class="font-mono text-sm">{player.avg_hltvRating.toFixed(2)}</span>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card class="border-primary/30">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center justify-between text-xl">
						<span class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full bg-red-500"></span>
							Team 2
						</span>
						<span class="text-2xl font-bold"
							>{team2.reduce((a, b) => a + b.avg_hltvRating, 0).toFixed(2)}</span
						>
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-1.5">
					{#each team2 as player}
						<div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
							<span class="truncate font-medium">{player.name}</span>
							<span class="font-mono text-sm">{player.avg_hltvRating.toFixed(2)}</span>
						</div>
					{/each}
				</CardContent>
			</Card>
		</div>

		<div class="rounded-lg bg-muted/50 p-4 text-center">
			<p class="text-sm text-muted-foreground">
				Rating Difference:
				<span class="font-medium text-foreground">
					{Math.abs(
						team1.reduce((a, b) => a + b.avg_hltvRating, 0) -
							team2.reduce((a, b) => a + b.avg_hltvRating, 0)
					).toFixed(2)}
				</span>
			</p>
		</div>
	{/if}
</div>
