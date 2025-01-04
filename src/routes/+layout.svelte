<script lang="ts">
	import { House } from 'lucide-svelte';
	import '../app.css';
	import { goto } from '$app/navigation';
	let { children } = $props();
</script>

<button onclick={() => goto('/')}>
	<House />
</button>
{@render children()}
