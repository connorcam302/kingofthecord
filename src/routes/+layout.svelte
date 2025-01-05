<script lang="ts">
	import { House } from 'lucide-svelte';
	import '../app.css';
	import { goto } from '$app/navigation';
	let { children } = $props();
</script>

<div class="mb-8 mt-2">
	<button onclick={() => goto('/')}>
		<h1 class="pb-2 pl-2 text-4xl">King of the Cord</h1>
	</button>
	{@render children()}
</div>
