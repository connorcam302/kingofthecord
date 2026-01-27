<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Upload } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	let {
		form
	}: {
		form: {
			reason?: string;
			results?: Array<{ id: string; status: string; reason?: string }>;
		} | null;
	} = $props();

	let selectedFiles = $state<FileList | null>(null);
	let uploading = $state(false);

	async function handleUpload() {
		if (!selectedFiles || selectedFiles.length === 0) return;

		uploading = true;

		const formData = new FormData();
		for (const file of selectedFiles) {
			formData.append('replays', file);
		}

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const text = await response.text();

			let result;
			try {
				result = JSON.parse(text);
			} catch {
				form = { reason: `Server error (${response.status}): ${text.slice(0, 200)}`, results: [] };
				uploading = false;
				return;
			}

			if (!response.ok) {
				form = { reason: result.reason || 'Upload failed', results: [] };
			} else {
				form = { results: result.results };
			}
		} catch (error) {
			form = { reason: 'Network error: ' + String(error), results: [] };
		} finally {
			uploading = false;
		}
	}
</script>

<svelte:head>
	<title>Upload Replays - King of the Cord</title>
</svelte:head>

<div class="container mx-auto max-w-2xl py-8">
	<h1 class="mb-6 text-3xl font-bold">Upload CS2 Replays</h1>

	<Card.Root class="mb-6">
		<Card.Header>
			<Card.Title>Replay Files</Card.Title>
			<Card.Description>Select your .dem files to parse and upload to the database</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleUpload();
				}}
				class="space-y-4"
			>
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
</div>
