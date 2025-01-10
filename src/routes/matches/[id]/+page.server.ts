import { calculateADR, calculateHLTVRating, calculateImpact, calculateSurvivalRate } from "$lib/utils";

export const load = async ({ params }) => {
	const matchData = import(`$lib/server/matches/${params.id}.json`).then(data => data.default).then(data => {
		const rounds = data.rounds.length
		console.log(Object.values(data.playerStats))
		return {
			...data,
			playerStats: data.playerStats.map(playerStat => {
				const kpr = playerStat.kills_total / rounds
				const dpr = playerStat.deaths_total / rounds
				const apr = playerStat.assists_total / rounds
				const adr = playerStat.damage_total / rounds
				const deaths = playerStat.deaths_total
				const survivalRate = (rounds - deaths) / rounds
				const impact = calculateImpact(playerStat)

				return {
					...playerStat,
					rawHLTVRating: { kpr, dpr, apr, impact, adr, survivalRate },
					hltvRating: calculateHLTVRating(kpr, dpr, apr, impact, adr, survivalRate)
				}
			}).sort((a, b) => b.hltvRating - a.hltvRating)
		}
	})

	return {
		matchData: await matchData,
		matchId: params.id
	};
};
