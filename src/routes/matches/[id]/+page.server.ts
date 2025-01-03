export const load = async ({ params }) => {
	const matchData = import(`$lib/server/matches/${params.id}.json`).then(data => data.default);

	return {
		matchData: await matchData,
		matchId: params.id
	};
};
