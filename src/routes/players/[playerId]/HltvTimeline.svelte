<script lang="ts">
	let { timeline } = $props();
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';

	Chart.register(...registerables);

	const largestY = Math.max(...timeline.map((d) => d.rating));
	const smallestY = Math.min(...timeline.map((d) => d.rating));

	const maxY = largestY + (largestY - smallestY) / 10;
	const minY = smallestY - (largestY - smallestY) / 10;

	let chart; // Reference to the Chart instance
	let chartData = {
		labels: timeline.map((d) => d.currentMatch.matchId),
		datasets: [
			{
				label: 'My Dataset',
				data: timeline.map((d) => d.rating),
				borderColor: 'rgb(255,199,56)',
				backgroundColor: 'rgb(255,199,56, 0.2)',
				borderWidth: 2,
				tension: 0.4 // Smooth curve
			}
		]
	};

	let chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				mode: 'index',
				intersect: false,
				itemSort: function (a: any, b: any) {
					return b.raw - a.raw;
				},
				displayColors: false,
				bodyFont: {
					size: 16
				},

				callbacks: {
					title: () => {
						return '';
					},
					label: (value) => {
						return 'Rating: ' + value.raw.toFixed(2);
					}
				}
			}
		},
		onClick(event, elements) {
			if (elements.length > 0) {
				const index = elements[0].index;
				const matchId = timeline[index].currentMatch.matchId;
				goto(`/matches/${matchId}`);
			}
		},
		scales: {
			x: {
				ticks: {
					display: false
				},
				beginAtZero: true
			},
			y: {
				min: minY,
				max: maxY
			}
		}
	};

	onMount(() => {
		const ctx = document.getElementById('line-chart').getContext('2d');

		chart = new Chart(ctx, {
			type: 'line',
			data: chartData,
			options: chartOptions
		});

		return () => chart.destroy(); // Clean up the chart instance
	});
</script>

<div class="flex flex-col gap-2">
	<canvas id="line-chart" class="h-full w-full"></canvas>
</div>

<style>
	canvas {
		max-width: 100%;
		height: auto;
	}
</style>
