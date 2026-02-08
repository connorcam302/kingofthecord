import { fetchMatches, getAllMatchIds } from '$lib/server/privateUtils';
import { calculatePlayerRating, calculateWeightedAvgRating } from '$lib/utils';
import {
	getLatestSeason,
	getActiveSteamids,
	getMatchesBySeason,
	getUserName
} from '$lib/server/mongodb';

export const load = async ({ params }) => {
	const latestSeason = await getLatestSeason();
	const matchData = await fetchMatches();
	const matchIdList = await getAllMatchIds();
	const activeSteamids = await getActiveSteamids();

	for (const match of matchData) {
		for (const playerStat of match.playerStats) {
			playerStat.name = await getUserName(playerStat.steamid);
		}
	}

	const latestSeasonMatches = matchData.filter((m) => m.season === latestSeason);

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

	const playerList = (
		await getUniquePlayers(latestSeasonMatches.map((match) => match.playerStats))
	).filter((player) => activeSteamids.includes(player.steamid));

	const playerStats: any[] = [];

	playerList.forEach((player) => {
		const mapStats = [];

		latestSeasonMatches.forEach((match) => {
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
		});

		const allHltvRatings = mapStats.map((stat) => stat.hltvRating).sort((a, b) => b - a);

		const sortedStats = mapStats.sort((a, b) => b.timestamp - a.timestamp);
		const hltvRatings = sortedStats;
		const previous20Games = sortedStats.slice(1, 21);

		const newAvg = calculateWeightedAvgRating(hltvRatings);
		const oldAvg = calculateWeightedAvgRating(previous20Games);

		playerStats.push({
			mapStats: mapStats.sort((a, b) => b.timestamp - a.timestamp),
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
			flashes: mapStats.reduce((total, stat) => total + stat.enemies_flashed_total, 0),
			avg_hltvRating: newAvg,
			old_avg_hltvRating: oldAvg,
			old_hltv_ratings: previous20Games.map((s) => s.hltvRating),
			hltv_ratings: hltvRatings.map((s) => s.hltvRating),
			all_hltv_ratings: allHltvRatings,
			ratingChange: newAvg - oldAvg
		});
	});

	return {
		matchIds: matchIdList,
		matchData: latestSeasonMatches,
		playerStats,
		latestSeason
	};
};
