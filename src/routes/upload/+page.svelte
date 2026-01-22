<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();

	let selectedFiles = $state<FileList | null>(null);
	let uploading = $state(false);
	let results = $state<Array<{ id: string; status: string; reason?: string }> | null>(null);
	let error = $state<string | null>(null);

	async function handleUpload() {
		if (!selectedFiles || selectedFiles.length === 0) return;

		uploading = true;
		error = null;
		results = null;

		const formData = new FormData();
		for (const file of selectedFiles) {
			formData.append('replays', file);
		}

		try {
			const response = await fetch(data.uploadMultipleUrl, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.reason || 'Upload failed';
				return;
			}

			results = result.results;
		} catch (err: any) {
			error = err.message;
		} finally {
			uploading = false;
		}
	}
</script>

<svelte:head>
	<title>Upload Replays - King of the Cord</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Upload CS2 Replays</h1>

	<div class="mb-8 rounded-lg border border-slate-700 bg-slate-800 p-6">
		<label class="mb-4 block">
			<span class="mb-2 block text-sm font-medium">Select .dem files</span>
			<input
				type="file"
				accept=".dem"
				multiple
				bind:files={selectedFiles}
				class="block w-full cursor-pointer rounded-lg border border-slate-600 bg-slate-700 p-4 text-slate-300 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
			/>
		</label>

		{#if selectedFiles && selectedFiles.length > 0}
			<div class="mb-4">
				<p class="text-sm text-slate-400">
					Selected {selectedFiles.length} file(s):
				</p>
				<ul class="mt-2 space-y-1">
					{#each Array.from(selectedFiles) as file}
						<li class="truncate text-sm text-slate-300">
							{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<button
			onclick={handleUpload}
			disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
			class="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{uploading ? 'Uploading...' : 'Upload Replays'}
		</button>
	</div>

	{#if error}
		<div class="mb-4 rounded-lg border border-red-600 bg-red-900/30 p-4 text-red-400">
			{error}
		</div>
	{/if}

	{#if results && results.length > 0}
		<div class="rounded-lg border border-slate-700 bg-slate-800 p-6">
			<h2 class="mb-4 text-xl font-semibold">Results</h2>
			<ul class="space-y-2">
				{#each results as result}
					<li class="flex items-center justify-between rounded bg-slate-700/50 p-3">
						<span class="truncate text-slate-300">{result.id}</span>
						<span
							class="rounded px-2 py-1 text-xs font-medium"
							class:bg-green-600={result.status === 'processed'}
							class:bg-yellow-600={result.status === 'skipped'}
							class:bg-red-600={result.status === 'failed'}
						>
							{result.status}
						</span>
					</li>
				{/each}
			</ul>
			<button
				onclick={() => goto('/')}
				class="mt-4 w-full rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700"
			>
				Go to Leaderboard
			</button>
		</div>
	{/if}
</div>
