<script lang="ts">
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { matchData, matchId }: { matchData } = data;

	console.log(matchData);
</script>

<div>{matchId}</div>
