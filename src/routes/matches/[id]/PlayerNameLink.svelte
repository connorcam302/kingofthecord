<script lang="ts">
	let { name, steamid } = $props();
</script>

<a href="/players/{steamid}" class="font-bold transition-colors hover:text-blue-400">{name}</a>
