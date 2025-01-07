<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Home, SwatchBook, Boxes, LinkedinIcon, TwitterIcon, GithubIcon } from 'lucide-svelte';
	let { children, data } = $props();

	let navbar = [
		{
			name: 'Home',
			path: '/',
			icon: Home
		},
		{
			name: 'Matches',
			path: '/matches',
			icon: SwatchBook
		},
		{
			name: 'Team Builder',
			path: '/team-builder',
			icon: Boxes
		}
	];

	$effect(() => {
		console.log(data.url);
	});
</script>

<Toaster />
<div class="mt-2 flex min-h-screen flex-col">
	<div class="mx-auto flex w-full max-w-screen-lg items-center justify-between">
		<button class="my-2 mb-4 flex items-center gap-2" onclick={() => goto('/')}>
			<img src="/logo.png" alt="King of the Cord" class="h-20 w-20" />
			<h1 class="font-impact text-5xl">KING OF THE CORD</h1>
		</button>
		<div class="flex items-center gap-2 px-2">
			{#key data.url}
				{#each navbar as nav}
					{#if data.url === nav.path}
						<Button variant="secondary" class="my-2 flex items-center gap-2 rounded-lg">
							<nav.icon />
							{nav.name}
						</Button>
					{:else}
						<Button
							variant="ghost"
							class="my-2 flex items-center gap-2 rounded-lg"
							onclick={() => goto(nav.path)}
						>
							<nav.icon />
							{nav.name}
						</Button>
					{/if}
				{/each}
			{/key}
		</div>
	</div>
	<div class="grow">
		{@render children()}
	</div>
	<div class="mt-8 flex flex-col gap-2 pb-2">
		<div class="flex justify-center gap-4 text-xl">
			<a
				href="https://www.linkedin.com/in/connor-campbell-600265175/"
				class="transition-all hover:text-yellow-300"><LinkedinIcon /></a
			>
			<a href="https://twitter.com/TheColfox" class="transition-all hover:text-yellow-300"
				><TwitterIcon /></a
			>
			<a href="https://github.com/kingofthecord" class="transition-all hover:text-yellow-300"
				><GithubIcon /></a
			>
		</div>
		<div class="flex justify-center text-xs">King of the Cord | Connor Campbell</div>
	</div>
</div>
