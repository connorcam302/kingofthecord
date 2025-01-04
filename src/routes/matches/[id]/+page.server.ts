export const load = async ({ params }) => {
	const matchData = import(`$lib/server/matches/${params.id}.json`).then(data => data.default).then(data => {
		return {
			...data,
			playerStats: data.playerStats.sort((a, b) => b.damage_total - a.damage_total)
		}
	})

	return {
		matchData: await matchData,
		matchId: params.id
	};
};
