import { fetchMatches, getAllMatchIds, getPlayerName } from '$lib/server/privateUtils';
import { calculatePlayerRating } from '$lib/utils';
import { getLatestSeason, getActiveSteamids, getMatchesBySeason } from '$lib/server/mongodb';

export const load = async ({ params }) => {
	const latestSeason = await getLatestSeason();
	const matchData = await fetchMatches();
	const matchIdList = await getAllMatchIds();
	const activeSteamids = await getActiveSteamids();

	const latestSeasonMatches = matchData.filter((m) => m.season === latestSeason);

	const getUniquePlayers = async (games) => {
		const uniquePlayers = {};

		for (const game of games) {
			for (const player of game) {
				if (!uniquePlayers[player.steamid]) {
					uniquePlayers[player.steamid] = {
						name: await getPlayerName(player.steamid),
						steamid: player.steamid
					};
				}
			}
		}

		return Object.values(uniquePlayers);
	};

	const removeBestAndWorstTenPercent = (array) => {
		if (array.length < 10) {
			return array;
		} else {
			array = array.sort((a, b) => b.hltvRating - a.hltvRating);
			const removeCount = Math.floor(array.length * 0.1);
			const newArray = array.slice(removeCount, -1 * removeCount);
			return array.slice(removeCount, -1 * removeCount);
		}
	};

	const calculateAvgHLTVRating = (array) => {
		array = array.sort((a, b) => b.hltvRating - a.hltvRating);
		return (
			removeBestAndWorstTenPercent(array).reduce((total, stat) => total + stat.hltvRating, 0) /
			removeBestAndWorstTenPercent(array).length
		);
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

		const playerInMostRecent =
			latestSeasonMatches
				.reduce((maxObj, currentObj) => {
					return currentObj.lobbyInfo.timestamp > maxObj.lobbyInfo.timestamp ? currentObj : maxObj;
				})
				.playerStats.filter((playerStat) => playerStat.steamid === player.steamid).length > 0;

		let oldHltvRatings;
		if (playerInMostRecent) {
			oldHltvRatings = removeBestAndWorstTenPercent(
				mapStats
					.slice()
					.sort((a, b) => a.timestamp - b.timestamp)
					.slice(0, -1)
			)
				.map((stat) => stat.hltvRating)
				.sort((a, b) => b - a);
		} else {
			oldHltvRatings = removeBestAndWorstTenPercent(
				mapStats.slice().sort((a, b) => a.timestamp - b.timestamp)
			)
				.map((stat) => stat.hltvRating)
				.sort((a, b) => b - a);
		}

		const hltvRatings = removeBestAndWorstTenPercent(mapStats)
			.map((stat) => stat.hltvRating)
			.sort((a, b) => b - a);

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
			avg_hltvRating: hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length,
			old_avg_hltvRating:
				oldHltvRatings.reduce((total, stat) => total + stat, 0) / oldHltvRatings.length,
			old_hltv_ratings: oldHltvRatings,
			hltv_ratings: hltvRatings,
			all_hltv_ratings: allHltvRatings,
			ratingChange:
				hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length -
				removeBestAndWorstTenPercent(
					mapStats
						.slice()
						.sort((a, b) => a.timestamp - b.timestamp)
						.slice(0, -1)
				)
					.map((stat) => stat.hltvRating)
					.sort((a, b) => b - a)
					.reduce((total, stat) => total + stat, 0) /
					oldHltvRatings.length
		});
	});

	return {
		matchIds: matchIdList,
		matchData: latestSeasonMatches,
		playerStats,
		latestSeason
	};
};
