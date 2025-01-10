import { getName } from "$lib/utils";

export const fetchMatches = async () => {
	const matchIds = async () => {
		const matchIds = await import('$lib/server/matches/matchIds.json');
		return matchIds.default;
	}

	const matches = [];

	const matchIdArray = await matchIds();
	for (const matchId of matchIdArray) {
		const match = await import(`$lib/server/matches/${matchId}.json`);
		matches.push(match.default);
	}

	matches.forEach(match => {
		match.playerStats.forEach(playerStat => {
			playerStat.name = getName(playerStat)
		})
	})
	return matches;
}
