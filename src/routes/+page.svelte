<script lang="ts">
	import { goto } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const { matchIds } = data;
</script>

<h1 class="text-4xl">King of the Cord</h1>
<ul>
	{#each matchIds as matchId}
		<li><button onclick={() => goto(`/matches/${matchId}`)}>{matchId}</button></li>
	{/each}
</ul>
