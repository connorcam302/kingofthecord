<script lang="ts">
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const { id } = data;
</script>

<div>{id}</div>
