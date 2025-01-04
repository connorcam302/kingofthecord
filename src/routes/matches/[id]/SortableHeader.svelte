<script>
	export let label;
	export let column;
	export let classProps;

	// Function to handle sorting toggle
	const toggleSorting = () => {
		column.toggleSorting(column.getIsSorted() === 'asc');
	};

	// Helper to determine the sort icon
	const getSortIcon = (isSorted) => {
		if (!isSorted) return '';
		if (isSorted === 'asc') return '▲';
		if (isSorted === 'desc') return '▼';
	};
</script>

<button on:click={toggleSorting} class={classProps}>
	<span>{label}</span>
	<span class="absolute pl-2">{getSortIcon(column.getIsSorted())}</span>
</button>
