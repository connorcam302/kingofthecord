import { getMatchById, getUserName } from '$lib/server/mongodb';
import { calculatePlayerRating } from '$lib/utils';

export const load = async ({ params }) => {
	const matchData = await getMatchById(params.id);

	if (!matchData) {
		throw new Error(`Match ${params.id} not found`);
	}

	for (const playerStat of matchData.playerStats) {
		playerStat.name = await getUserName(playerStat.steamid);
	}

	const rounds = matchData.rounds.length;
	const enrichedData = {
		...matchData,
		playerStats: matchData.playerStats
			.map((playerStat) => {
				const ratingData = calculatePlayerRating(playerStat, rounds);
				return {
					...playerStat,
					...ratingData
				};
			})
			.sort((a, b) => b.hltvRating - a.hltvRating)
	};

	return {
		matchData: enrichedData,
		matchId: params.id
	};
};
