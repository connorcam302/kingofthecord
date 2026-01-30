import { fetchMatches, getPlayerName } from '$lib/server/privateUtils';
import { calculatePlayerRating, getMapString } from '$lib/utils';
import { getAllSeasons, getActiveSteamids } from '$lib/server/mongodb';

export const load = async ({ params }) => {
	const matchData = await fetchMatches();
	const seasons = await getAllSeasons();
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

				const winner =
					match.rounds[match.rounds.length - 1].teamOneScore >
					match.rounds[match.rounds.length - 1].teamTwoScore
						? 2
						: 3;

				const didPlayerWin = playerTeam === winner;

				mapStats.push({
					...playerMatchData,
					...ratingData,
					isWinningTeam,
					timestamp: match.lobbyInfo.timestamp,
					matchId: match.lobbyInfo.id,
					map: match.lobbyInfo.map_name,
					didPlayerWin,
					rounds: match.rounds.length,
					teamOneScore: match.rounds[match.rounds.length - 1].teamOneScore,
					teamTwoScore: match.rounds[match.rounds.length - 1].teamTwoScore,
					rounds: match.rounds,
					season: match.season
				});
			}
		});

		const allHltvRatings = mapStats.map((stat) => stat.hltvRating).sort((a, b) => b - a);

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

	const hltvTimeline = [];
	const tempTimeline = [];
	playerStats
		.find((playerStat) => playerStat.steamid === params.playerId)
		.mapStats.reverse()
		.forEach((stat) => {
			tempTimeline.push({
				hltvRating: stat.hltvRating,
				timestamp: stat.timestamp,
				matchId: stat.matchId,
				kills: stat.kills_total,
				deaths: stat.deaths_total,
				assists: stat.assists_total,
				adr: stat.adr
			});
			hltvTimeline.push({
				rating: calculateAvgHLTVRating(tempTimeline),
				currentMatch: {
					hltvRating: stat.hltvRating,
					timestamp: stat.timestamp,
					matchId: stat.matchId,
					kills: stat.kills_total,
					deaths: stat.deaths_total,
					assists: stat.assists_total,
					adr: stat.adr
				}
			});
		});

	const maps = Array.from(
		new Set(
			playerStats
				.find((playerStat) => playerStat.steamid === params.playerId)
				.mapStats.map((x) => x.map)
		)
	).sort();

	const mapStats = [];
	maps.forEach((map) => {
		const wins = playerStats
			.find((playerStat) => playerStat.steamid === params.playerId)
			.mapStats.filter((x) => x.map === map && x.didPlayerWin).length;
		const matchesPlayed = playerStats
			.find((playerStat) => playerStat.steamid === params.playerId)
			.mapStats.filter((x) => x.map === map).length;
		mapStats.push({
			name: getMapString(map),
			matches: playerStats
				.find((playerStat) => playerStat.steamid === params.playerId)
				.mapStats.filter((x) => x.map === map).length,
			winRate: ((wins / matchesPlayed) * 100).toFixed(0) + ' %',
			avgKills: (
				playerStats
					.find((playerStat) => playerStat.steamid === params.playerId)
					.mapStats.filter((x) => x.map === map)
					.reduce((total, stat) => total + stat.kills_total, 0) / matchesPlayed
			).toFixed(1),
			avgDeaths: (
				playerStats
					.find((playerStat) => playerStat.steamid === params.playerId)
					.mapStats.filter((x) => x.map === map)
					.reduce((total, stat) => total + stat.deaths_total, 0) / matchesPlayed
			).toFixed(1),
			avgAssists: (
				playerStats
					.find((playerStat) => playerStat.steamid === params.playerId)
					.mapStats.filter((x) => x.map === map)
					.reduce((total, stat) => total + stat.assists_total, 0) / matchesPlayed
			).toFixed(1),
			avgAdr: (
				playerStats
					.find((playerStat) => playerStat.steamid === params.playerId)
					.mapStats.filter((x) => x.map === map)
					.reduce((total, stat) => total + stat.adr, 0) / matchesPlayed
			).toFixed(0),
			avgRating: (
				playerStats
					.find((playerStat) => playerStat.steamid === params.playerId)
					.mapStats.filter((x) => x.map === map)
					.reduce((total, stat) => total + stat.hltvRating, 0) / matchesPlayed
			).toFixed(2)
		});
	});

	const duels = [];

	playerStats
		.find((playerStat) => playerStat.steamid === params.playerId)
		.mapStats.forEach((match) => {
			const matchDuels = {
				map: match.map,
				id: match.matchId,
				duels: {}
			};
			match.rounds.forEach((round) => {
				const outGoingDamage = round.damage.find((x) => x.attacker_steamid === params.playerId);
				outGoingDamage?.damage_dealt.forEach((attackerDamage) => {
					const attackerKill = attackerDamage.killed;
					const defenderId = attackerDamage.defender;
					const defenderName = attackerDamage.defenderName;

					if (!matchDuels.duels[defenderId]) {
						matchDuels.duels[defenderId] = {
							name: defenderName,
							defender: defenderId,
							attackerScore: 0,
							defenderScore: 0
						};
					}

					const defenderData = round.damage.find((x) => x.attacker_steamid === defenderId);
					const defenderKill =
						defenderData?.damage_dealt.find((x) => x.defender === params.playerId)?.killed || false;

					if (attackerKill) {
						matchDuels.duels[defenderId].attackerScore += 1;
					} else if (defenderKill) {
						matchDuels.duels[defenderId].defenderScore += 1;
					}
				});
			});

			duels.push(matchDuels);
		});

	return {
		hltvTimeline: hltvTimeline,
		stats: playerStats.find((playerStat) => playerStat.steamid === params.playerId),
		maps: mapStats.sort((a, b) => b.matches - a.matches),
		duels,
		seasons
	};
};
