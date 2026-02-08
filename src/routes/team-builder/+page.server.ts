import {
	getLatestSeason,
	getMatchesBySeason,
	getActiveSteamids,
	getUserName
} from '$lib/server/mongodb';
import { calculatePlayerRating, calculateWeightedAvgRating } from '$lib/utils';

export const load = async ({ params }) => {
	const latestSeason = await getLatestSeason();
	const matchData = await getMatchesBySeason(latestSeason);
	const activeSteamids = await getActiveSteamids();

	const getUniquePlayers = (games) => {
		const uniquePlayers = {};

		games.forEach((game) => {
			game.forEach((player) => {
				if (!uniquePlayers[player.steamid]) {
					uniquePlayers[player.steamid] = {
						name: player.steamid,
						steamid: player.steamid
					};
				}
			});
		});

		return Object.values(uniquePlayers);
	};

	const playerStats = [];
	const playerList = getUniquePlayers(matchData.map((match) => match.playerStats)).filter(
		(player) => activeSteamids.includes(player.steamid)
	);

	for (const player of playerList) {
		const mapStats = [];

		for (const match of matchData) {
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
			name: await getUserName(player.steamid),
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
	}

	return {
		playerStats
	};
};
