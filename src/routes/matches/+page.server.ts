import { fetchMatches, getAllMatchIds } from '$lib/server/privateUtils';
import { calculatePlayerRating, calculateWeightedAvgRating } from '$lib/utils';
import { getAllSeasons, getActiveSteamids, getUserName } from '$lib/server/mongodb';

export const load = async ({ params }) => {
	const matchData = await fetchMatches();
	const matchIdList = await getAllMatchIds();
	const seasons = await getAllSeasons();
	const activeSteamids = await getActiveSteamids();

	for (const match of matchData) {
		for (const playerStat of match.playerStats) {
			playerStat.name = await getUserName(playerStat.steamid);
		}
	}

	const getUniquePlayers = async (games) => {
		const uniquePlayers = {};

		for (const game of games) {
			for (const player of game) {
				if (!uniquePlayers[player.steamid]) {
					uniquePlayers[player.steamid] = {
						name: await getUserName(player.steamid),
						steamid: player.steamid
					};
				}
			}
		}

		return Object.values(uniquePlayers);
	};

	const playerStats = [];
	const playerList = (await getUniquePlayers(matchData.map((match) => match.playerStats))).filter(
		(player) => activeSteamids.includes(player.steamid)
	);

	playerList.forEach((player) => {
		const mapStats = [];

		matchData.forEach((match) => {
			const playerMatchData = match.playerStats.find(
				(playerStat) => playerStat.steamid === player.steamid
			);

			if (playerMatchData) {
				const ratingData = calculatePlayerRating(playerMatchData, match.rounds.length);

				const playerTeam = match.playerStats.find(
					(playerStat) => playerStat.steamid === player.steamid
				)?.team_number;

				const winningTeam =
					match.rounds[match.rounds.length - 1].teamOneScore >
					match.rounds[match.rounds.length - 1].teamTwoScore
						? 2
						: 3;

				const isWinningTeam = playerTeam === winningTeam;

				mapStats.push({
					...playerMatchData,
					...ratingData,
					isWinningTeam,
					timestamp: match.lobbyInfo.timestamp
				});
			}
		}

		playerStats.push({
			mapStats,
			...player,
			kpr: mapStats.reduce((total, stat) => total + stat.kpr, 0) / mapStats.length,
			dpr: mapStats.reduce((total, stat) => total + stat.dpr, 0) / mapStats.length,
			apr: mapStats.reduce((total, stat) => total + stat.apr, 0) / mapStats.length,
			impact: mapStats.reduce((total, stat) => total + stat.impact, 0) / mapStats.length,
			adr: mapStats.reduce((total, stat) => total + stat.adr, 0) / mapStats.length,
			survivalRate:
				mapStats.reduce((total, stat) => total + stat.survivalRate, 0) / mapStats.length,
			kills: mapStats.reduce((total, stat) => total + stat.kills_total, 0),
			deaths: mapStats.reduce((total, stat) => total + stat.deaths_total, 0),
			assists: mapStats.reduce((total, stat) => total + stat.assists_total, 0),
			avg_hltvRating: mapStats.length > 0 ? calculateWeightedAvgRating(mapStats) : 0
		});
	});

	const matchesWithSeasons = matchData
		.map((match) => ({
			...match,
			season: match.season || 1
		}))
		.sort((a, b) => b.lobbyInfo.timestamp - a.lobbyInfo.timestamp);

	return {
		matchIds: matchIdList,
		matchData: matchesWithSeasons,
		playerStats,
		seasons
	};
};
