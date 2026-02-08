<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Upload } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	let {
		form
	}: {
		form: {
			reason?: string;
			results?: Array<{ id: string; status: string; reason?: string }>;
			newPlayers?: Array<{ steamid: string; name: string }>;
		} | null;
	} = $props();

	let selectedFiles = $state<FileList | null>(null);
	let uploading = $state(false);
	let playerNames = $state<Record<string, string>>({});
	let addingPlayers = $state(false);
	let addedPlayers = $state<string[]>([]);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedFiles || selectedFiles.length === 0) return;

		uploading = true;
		const formEl = e.target as HTMLFormElement;

		console.log('uploading file to /api/upload');

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: new FormData(formEl)
			});

			const text = await response.text();
			console.log('Upload response:', response.status, text.slice(0, 200));

			const result = JSON.parse(text);

			if (!response.ok) {
				form = { reason: result.reason || 'Upload failed', results: [] };
			} else {
				form = { results: result.results, newPlayers: result.newPlayers || [] };
				playerNames = {};
				addedPlayers = [];
				if (result.newPlayers) {
					for (const player of result.newPlayers) {
						playerNames[player.steamid] = player.name;
					}
				}
			}
		} catch (error) {
			console.error('Upload error:', error);
			form = { reason: 'Network error: ' + String(error), results: [] };
		} finally {
			uploading = false;
		}
	}

	async function addPlayer(steamid: string) {
		const displayName = playerNames[steamid];
		if (!displayName) return;

		addingPlayers = true;
		try {
			const response = await fetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ steamid, displayName })
			});

			if (response.ok) {
				addedPlayers = [...addedPlayers, steamid];
			} else {
				console.error('Failed to add player');
			}
		} catch (error) {
			console.error('Error adding player:', error);
		} finally {
			addingPlayers = false;
		}
	}

	async function addAllPlayers() {
		if (!form?.newPlayers) return;

		addingPlayers = true;
		for (const player of form.newPlayers) {
			if (!addedPlayers.includes(player.steamid)) {
				try {
					await fetch('/api/users', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ steamid: player.steamid, displayName: playerNames[player.steamid] || player.name })
					});
					addedPlayers = [...addedPlayers, player.steamid];
				} catch (error) {
					console.error('Error adding player:', error);
				}
			}
		}
		addingPlayers = false;
	}
</script>

<svelte:head>
	<title>Upload Replays - King of the Cord</title>
</svelte:head>

<div class="container mx-auto max-w-2xl py-8">
	<h1 class="mb-6 text-3xl font-bold">Upload CS2 Replays</h1>

	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Replay Files.</Card.Title>
			<Card.Description>Select your .dem files to parse and upload to the database</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} enctype="multipart/form-data" class="space-y-4">
				<div class="space-y-2">
					<input
						type="file"
						accept=".dem"
						multiple
						name="replays"
						bind:files={selectedFiles}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:me-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:text-sm file:text-primary-foreground hover:file:bg-primary/90"
					/>
				</div>

				{#if selectedFiles && selectedFiles.length > 0}
					<div class="rounded-md bg-muted p-4">
						<p class="mb-2 text-sm font-medium">Selected {selectedFiles.length} file(s):</p>
						<ul class="space-y-1">
							{#each Array.from(selectedFiles) as file}
								<li class="truncate text-sm text-muted-foreground">
									{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<Button
					type="submit"
					disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
					class="w-full"
				>
					{#if uploading}
						Uploading...
					{:else}
						<Upload class="me-2 h-4 w-4" />
						Upload Replays
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	{#if form?.reason}
		<div
			class="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive"
		>
			{form.reason}
		</div>
	{/if}

	{#if form?.results && form.results.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title>Results</Card.Title>
			</Card.Header>
			<Card.Content>
				<ul class="space-y-2">
					{#each form.results as result}
						<li class="flex items-center justify-between rounded-md bg-muted p-3">
							<span class="truncate">{result.id}</span>
							<span
								class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
								class:bg-green-50={result.status === 'processed'}
								class:text-green-700={result.status === 'processed'}
								class:bg-yellow-50={result.status === 'skipped'}
								class:text-yellow-700={result.status === 'skipped'}
								class:bg-red-50={result.status === 'failed'}
								class:text-red-700={result.status === 'failed'}
							>
								{result.status}
							</span>
						</li>
					{/each}
				</ul>
				<Button variant="outline" onclick={() => goto('/')} class="mt-4 w-full">
					Go to Leaderboard
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if form?.newPlayers && form.newPlayers.length > 0}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title>Add New Players</Card.Title>
				<Card.Description>The following players were found in the uploaded replays and don't exist in the database yet.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each form.newPlayers as player}
					{@const isAdded = addedPlayers.includes(player.steamid)}
					<div class="flex items-center gap-2">
						<div class="flex-1">
							<Label for={player.steamid} class="sr-only">Player name</Label>
							<Input
								id={player.steamid}
								type="text"
								placeholder={player.name}
								bind:value={playerNames[player.steamid]}
								disabled={isAdded || addingPlayers}
							/>
						</div>
						<Button
							variant={isAdded ? 'outline' : 'default'}
							size="sm"
							disabled={isAdded || addingPlayers}
							onclick={() => addPlayer(player.steamid)}
						>
							{isAdded ? 'Added' : 'Add'}
						</Button>
					</div>
				{/each}
				<Button
					onclick={addAllPlayers}
					disabled={addingPlayers || addedPlayers.length === form.newPlayers?.length}
					class="w-full"
				>
					{addingPlayers ? 'Adding...' : 'Add All Players'}
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
