<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { ratingWeights, ratingNormalization } from '$lib/utils';

	Chart.register(...registerables);

	let { player, rating } = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	let kpr = $derived(player.rawHLTVRating?.kpr ? parseFloat(player.rawHLTVRating.kpr) : 0);
	let dpr = $derived(player.rawHLTVRating?.dpr ? parseFloat(player.rawHLTVRating.dpr) : 0);
	let apr = $derived(player.rawHLTVRating?.apr ? parseFloat(player.rawHLTVRating.apr) : 0);
	let impact = $derived(player.rawHLTVRating?.impact ?? 0);
	let adr = $derived(player.rawHLTVRating?.adr ? parseFloat(player.rawHLTVRating.adr) : 0);
	let survivalRate = $derived(
		player.rawHLTVRating?.survivalRate ? parseFloat(player.rawHLTVRating.survivalRate) : 0
	);

	const normalized = $derived({
		kpr: kpr / ratingNormalization.kpr,
		dpr: 1 - dpr / ratingNormalization.dpr,
		apr: apr / ratingNormalization.apr,
		impact: impact * ratingNormalization.impactMultiplier,
		adr: adr / ratingNormalization.adr,
		survivalRate: survivalRate / ratingNormalization.survivalRate
	});

	const contributions = $derived({
		kpr: ratingWeights.kpr * normalized.kpr,
		dpr: ratingWeights.dpr * normalized.dpr,
		apr: ratingWeights.apr * normalized.apr,
		impact: ratingWeights.impact * normalized.impact,
		adr: ratingWeights.adr * normalized.adr,
		survivalRate: ratingWeights.survivalRate * normalized.survivalRate
	});

	let chartData = $derived({
		labels: ['KPR', 'DPR', 'APR', 'Impact', 'ADR', 'Survival'],
		datasets: [
			{
				label: 'Contribution to Rating',
				data: [
					contributions.kpr,
					contributions.dpr,
					contributions.apr,
					contributions.impact,
					contributions.adr,
					contributions.survivalRate
				],
				backgroundColor: [
					'rgba(59, 130, 246, 0.7)',
					'rgba(239, 68, 68, 0.7)',
					'rgba(34, 197, 94, 0.7)',
					'rgba(168, 85, 247, 0.7)',
					'rgba(249, 115, 22, 0.7)',
					'rgba(236, 72, 153, 0.7)'
				],
				borderColor: [
					'rgb(59, 130, 246)',
					'rgb(239, 68, 68)',
					'rgb(34, 197, 94)',
					'rgb(168, 85, 247)',
					'rgb(249, 115, 22)',
					'rgb(236, 72, 153)'
				],
				borderWidth: 1
			}
		]
	});

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'bar',
			data: chartData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				scales: {
					x: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Rating Contribution'
						}
					}
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const label = context.label;
								const rawValue = context.raw as number;
								const actualValue =
									label === 'KPR'
										? kpr.toFixed(3)
										: label === 'DPR'
											? dpr.toFixed(3)
											: label === 'APR'
												? apr.toFixed(3)
												: label === 'Impact'
													? impact.toFixed(2)
													: label === 'ADR'
														? adr.toFixed(1)
														: survivalRate.toFixed(3);
								return `${label}: ${actualValue} (contribution: ${rawValue.toFixed(3)})`;
							}
						}
					}
				}
			}
		});

		return () => {
			chart.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data = chartData;
			chart.update();
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-4">
		<div class="text-2xl font-bold">{player.name}</div>
		<div class="rounded-lg bg-secondary px-3 py-1 text-xl font-bold">
			{rating?.toFixed(2) ?? 'N/A'}
		</div>
	</div>
	<div class="h-64 w-full rounded-lg border p-4">
		<canvas bind:this={canvas}></canvas>
	</div>
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">KPR ({kpr.toFixed(3)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.kpr} × Normalized: {normalized.kpr.toFixed(3)}
			</div>
			<div class="text-blue-500">Contribution: {contributions.kpr.toFixed(3)}</div>
		</div>
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">DPR ({dpr.toFixed(3)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.dpr} × Normalized: {normalized.dpr.toFixed(3)}
			</div>
			<div class="text-red-500">Contribution: {contributions.dpr.toFixed(3)}</div>
		</div>
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">APR ({apr.toFixed(3)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.apr} × Normalized: {normalized.apr.toFixed(3)}
			</div>
			<div class="text-green-500">Contribution: {contributions.apr.toFixed(3)}</div>
		</div>
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">Impact ({impact.toFixed(2)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.impact} × Normalized: {normalized.impact.toFixed(3)}
			</div>
			<div class="text-purple-500">Contribution: {contributions.impact.toFixed(3)}</div>
		</div>
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">ADR ({adr.toFixed(1)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.adr} × Normalized: {normalized.adr.toFixed(3)}
			</div>
			<div class="text-orange-500">Contribution: {contributions.adr.toFixed(3)}</div>
		</div>
		<div class="rounded-lg border p-3">
			<div class="text-sm text-muted-foreground">Survival ({survivalRate.toFixed(3)})</div>
			<div class="font-medium">
				Weight: {ratingWeights.survivalRate} × Normalized: {normalized.survivalRate.toFixed(3)}
			</div>
			<div class="text-pink-500">Contribution: {contributions.survivalRate.toFixed(3)}</div>
		</div>
	</div>
</div>
