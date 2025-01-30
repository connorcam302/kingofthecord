<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import {
		Home,
		SwatchBook,
		Boxes,
		LinkedinIcon,
		TwitterIcon,
		GithubIcon,
		ChartBarIcon
	} from 'lucide-svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { fade, fly } from 'svelte/transition';
	import HamburgerIcon from '$lib/components/HamburgerIcon.svelte';

	let { children, data } = $props();
	let displayMobileMenu = $state(false);

	const navigate = (path: string) => {
		displayMobileMenu = false;
		goto(path);
	};

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
		},
		{
			name: 'Stats',
			path: '/stats',
			icon: ChartBarIcon
		}
	];
</script>

<Toaster />
<div class="mt-2 flex min-h-screen flex-col">
	<div class="mx-auto flex w-full max-w-screen-lg items-center justify-between">
		<button class="my-2 mb-4 flex items-center gap-2" onclick={() => goto('/')}>
			<img src="/logo.png" alt="King of the Cord" class="h-20 w-20" />
			<h1 class="hidden font-impact text-xl md:block md:text-5xl">KING OF THE CORD</h1>
		</button>
		<div class="md:hidden">
			<button onclick={() => (displayMobileMenu = !displayMobileMenu)}>
				<HamburgerIcon open={displayMobileMenu} />
			</button>
		</div>
		<div class="hidden items-center gap-2 px-2 md:flex">
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

	{#key data.url}
		<div in:fade={{ delay: 120, duration: 250 }} class="flex grow items-start justify-center">
			{#if navigating.to}
				<div class="flex grow items-center justify-center">
					<Loading />
				</div>
			{:else}
				{@render children()}
			{/if}
		</div>
	{/key}
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

{#if displayMobileMenu}
	<div
		transition:fade={{ duration: 200 }}
		id="backdrop"
		class="fixed top-0 h-screen w-screen cursor-default md:hidden"
		onclick={() => (displayMobileMenu = false)}
		onkeypress={(e) => e.key === 'Escape' && (displayMobileMenu = false)}
		tabindex="0"
		role="button"
	>
		<div
			transition:fly={{ x: -1000, duration: 500 }}
			class="absolute inset-y-0 top-0 h-screen w-72 bg-slate-900 opacity-100"
		>
			<div class="flex flex-col gap-4 px-2 text-lg">
				<button class="mx-auto my-4 flex items-center" onclick={() => navigate('/')}>
					<img src="/logo.png" alt="King of the Cord" class="h-16 w-16" />
					<h1 class="font-impact text-3xl">KING OF THE CORD</h1>
				</button>
				<ul class="flex flex-col gap-2 text-left text-2xl">
					{#each navbar as { name, path, icon }}
						<li>
							{name}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}
