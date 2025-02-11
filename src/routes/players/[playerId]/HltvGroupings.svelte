<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { writable } from 'svelte/store';
	import { getMapString } from '$lib/utils';

	export let matchData = [];
	export let interval = 0.1;

	let chartCanvas;
	let chartInstance;

	const hltvGroups = writable({});

	function processData() {
		const counts = {};

		// Ensure all intervals from 0 to 4.9 are present with custom step
		for (let i = 0; i <= Math.floor(4.9 / interval); i++) {
			counts[(i * interval).toFixed(1)] = {};
		}
		counts['5.0+'] = {};

		matchData.forEach((match) => {
			if (match.hltvRating !== undefined) {
				const rating =
					match.hltvRating >= 5.0
						? '5.0+'
						: (Math.floor(match.hltvRating / interval) * interval).toFixed(1);

				if (!counts[rating][match.map]) {
					counts[rating][match.map] = 0;
				}

				counts[rating][match.map] += 1;
			}
		});

		hltvGroups.set(counts);
	}

	function renderChart() {
		if (chartInstance) {
			chartInstance.destroy();
		}

		hltvGroups.subscribe((groups) => {
			const labels = Object.keys(groups).sort((a, b) => parseFloat(a) - parseFloat(b));
			const maps = new Set();

			Object.values(groups).forEach((mapCounts) => {
				Object.keys(mapCounts).forEach((map) => maps.add(map));
			});

			const datasets = Array.from(maps).map((map, index) => {
				const colors = [
					'rgba(255, 99, 132, 0.6)',
					'rgba(54, 162, 235, 0.6)',
					'rgba(255, 206, 86, 0.6)',
					'rgba(89, 189, 95, 0.6)',
					'rgba(75, 192, 192, 0.6)',
					'rgba(153, 102, 255, 0.6)',
					'rgba(255, 159, 64, 0.6)',
					'rgba(32, 190, 156, 0.6)'
				];
				return {
					label: getMapString(map),
					data: labels.map((label) => groups[label][map] || 0),
					backgroundColor: colors[index % colors.length].replace('0.6', '1'),
					borderColor: colors[index % colors.length].replace('0.6', '1')
				};
			});

			chartInstance = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels,
					datasets
				},
				options: {
					responsive: true,
					scales: {
						x: { title: { display: true, text: 'HLTV Rating' }, stacked: true },
						y: { title: { display: true, text: 'Count' }, beginAtZero: true, stacked: true }
					}
				}
			});
		});
	}

	onMount(() => {
		processData();
		renderChart();
	});
</script>

<canvas bind:this={chartCanvas}></canvas>
