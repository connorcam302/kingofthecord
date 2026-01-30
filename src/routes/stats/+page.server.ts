import { fetchMatches, getAllMatchIds, getPlayerName } from '$lib/server/privateUtils';
import { calculatePlayerRating } from '$lib/utils';
import { getActiveSteamids } from '$lib/server/mongodb';

export const load = async ({ params }) => {
	const matchData = await fetchMatches();
	const matchIdList = await getAllMatchIds();
	const activeSteamids = await getActiveSteamids();

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
					timestamp: match.lobbyInfo.timestamp,
					map: match.lobbyInfo.map_name
				});
			}
		});

		const allHltvRatings = mapStats.map((stat) => stat.hltvRating).sort((a, b) => b - a);

		const recentGames = mapStats.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

		const playerInMostRecent =
			matchData
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

		const formGames = mapStats.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
		const form = (
			formGames.reduce((total, stat) => total + stat.hltvRating, 0) / formGames.length
		).toFixed(2);

		const headshotPercentage = (
			(mapStats.reduce((total, stat) => total + stat.headshot_kills_total, 0) /
				mapStats.reduce((total, stat) => total + stat.kills_total, 0)) *
			100
		).toFixed(1);

		const getHighestAndLowestAvgRating = (mapStats) => {
			const mapRatings = {};

			mapStats.forEach((match) => {
				const mapName = match.map;
				if (!mapRatings[mapName]) {
					mapRatings[mapName] = { totalRating: 0, count: 0 };
				}
				mapRatings[mapName].totalRating += match.hltvRating;
				mapRatings[mapName].count += 1;
			});

			const avgRatings = Object.entries(mapRatings).map(([map, data]) => ({
				map,
				avgRating: data.totalRating / data.count
			}));

			const highestMap = avgRatings.reduce((a, b) => (a.avgRating > b.avgRating ? a : b)).map;
			const lowestMap = avgRatings.reduce((a, b) => (a.avgRating < b.avgRating ? a : b)).map;

			return { highestMap, lowestMap };
		};

		const { highestMap, lowestMap } = getHighestAndLowestAvgRating(mapStats);

		playerStats.push({
			mapStats: mapStats.sort((a, b) => b.timestamp - a.timestamp),
			...player,
			kpr: mapStats.reduce((total, stat) => total + stat.kpr, 0) / mapStats.length,
			dpr: mapStats.reduce((total, stat) => total + stat.dpr, 0) / mapStats.length,
			apr: mapStats.reduce((total, stat) => total + stat.apr, 0) / mapStats.length,
			impact: recentGames.reduce((total, stat) => total + stat.impact, 0) / recentGames.length,
			adr: mapStats.reduce((total, stat) => total + stat.adr, 0) / mapStats.length,
			kills: mapStats.reduce((total, stat) => total + stat.kills_total, 0) / mapStats.length,
			deaths: mapStats.reduce((total, stat) => total + stat.deaths_total, 0) / mapStats.length,
			assists: mapStats.reduce((total, stat) => total + stat.assists_total, 0) / mapStats.length,
			flashes:
				mapStats.reduce((total, stat) => total + stat.enemies_flashed_total, 0) / mapStats.length,
			utilityDamage:
				mapStats.reduce((total, stat) => total + stat.utility_damage_total, 0) / mapStats.length,
			winRate:
				(mapStats.reduce((total, stat) => total + stat.isWinningTeam, 0) / mapStats.length) * 100,
			matches: mapStats.length,
			headshotPercentage,
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
					oldHltvRatings.length,
			form,
			highestMap,
			lowestMap
		});
	});

	return {
		matchData,
		playerStats
	};
};
