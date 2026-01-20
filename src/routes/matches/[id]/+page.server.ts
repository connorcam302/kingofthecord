import {
	calculateADR,
	calculateHLTVRating,
	calculateImpact,
	calculateSurvivalRate
} from '$lib/utils';
import { getMatchById, getUserName } from '$lib/server/mongodb';

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
				const kpr = playerStat.kills_total / rounds;
				const dpr = playerStat.deaths_total / rounds;
				const apr = playerStat.assists_total / rounds;
				const adr = playerStat.damage_total / rounds;
				const deaths = playerStat.deaths_total;
				const survivalRate = (rounds - deaths) / rounds;
				const impact = calculateImpact(playerStat);

				return {
					...playerStat,
					rawHLTVRating: {
						kpr: kpr.toFixed(2),
						dpr: dpr.toFixed(2),
						apr: apr.toFixed(2),
						impact,
						adr: adr.toFixed(2),
						survivalRate: survivalRate.toFixed(2)
					},
					hltvRating: calculateHLTVRating(kpr, dpr, apr, impact, adr, survivalRate)
				};
			})
			.sort((a, b) => b.hltvRating - a.hltvRating)
	};

	return {
		matchData: enrichedData,
		matchId: params.id
	};
};
