<script lang="ts">
	import { Calculator, Info } from 'lucide-svelte';
	import tippy from 'sveltejs-tippy';

	interface MatchRating {
		hltvRating: number;
		timestamp: number;
		map: string;
	}

	interface Props {
		mapStats: MatchRating[];
	}

	let { mapStats }: Props = $props();

	const calculateRatingWeights = (matches: MatchRating[]) => {
		const recentGames = matches.slice(0, 20);

		return recentGames.map((match, index) => {
			let weight;
			if (index < 10) {
				weight = 1;
			} else {
				weight = Math.log(21 - index) / Math.log(11);
			}
			return {
				...match,
				position: index,
				weight,
				weightedRating: match.hltvRating * weight
			};
		});
	};

	let ratingData = $derived(calculateRatingWeights(mapStats));
	let totalWeight = $derived(ratingData.reduce((sum, m) => sum + m.weight, 0));
	let finalRating = $derived(
		ratingData.reduce((sum, m) => sum + m.weightedRating, 0) / totalWeight
	);

	const getWeightPercent = (weight: number) => (weight / totalWeight) * 100;
</script>

<div class="rounded-xl border p-4">
	<div class="mb-4 flex items-center gap-2">
		<Calculator class="h-5 w-5" />
		<h2 class="text-lg font-semibold">Rating Calculation Breakdown</h2>
		<div
			use:tippy={{
				content:
					'Your rating is a weighted average of your last 20 games using logarithmic decay. Newer games have more impact.'
			}}
		>
			<Info class="h-4 w-4 cursor-help text-muted-foreground" />
		</div>
	</div>

	<div class="mb-4 rounded-lg bg-muted p-3">
		<div class="text-sm text-muted-foreground">Weighted Average (Last 20 Games)</div>
		<div class="text-2xl font-bold">{finalRating.toFixed(2)}</div>
	</div>

	<div class="max-h-80 space-y-2 overflow-y-auto pr-2">
		<div
			class="sticky top-0 grid grid-cols-[40px_1fr_80px_80px_80px] gap-2 bg-background pb-2 text-xs text-muted-foreground"
		>
			<div>#</div>
			<div>Weight</div>
			<div>Rating</div>
			<div>Weighted</div>
			<div class="text-right">Date</div>
		</div>

		{#each ratingData as match}
			<div class="grid grid-cols-[40px_1fr_80px_80px_80px] items-center gap-2 rounded py-1">
				<div class="text-sm text-muted-foreground">{20 - match.position}</div>
				<div class="relative h-6 overflow-hidden rounded bg-muted">
					<div
						class="absolute left-0 top-0 h-full bg-primary/60"
						style="width: {getWeightPercent(match.weight)}%"
					></div>
					<span class="absolute inset-0 flex items-center pl-2 text-xs font-medium">
						{match.weight.toFixed(2)}
					</span>
				</div>
				<div class="text-sm font-medium">{match.hltvRating.toFixed(2)}</div>
				<div class="text-sm text-muted-foreground">{match.weightedRating.toFixed(2)}</div>
				<div class="text-right text-xs text-muted-foreground">
					{new Date(match.timestamp * 1000).toLocaleDateString()}
				</div>
			</div>
		{/each}
	</div>
</div>
