
import { fetchMatches } from '$lib/server/privateUtils';
import { calculateHLTVRating, calculateImpact, getMapString, getName } from '$lib/utils';

export const load = async ({ params }) => {
	const matchIds = async () => {
		const matchIds = await import('$lib/server/matches/matchIds.json');
		return matchIds.default;
	}

	const matchData = await fetchMatches(await matchIds());


	// Function to extract unique players with their steamid
	const getUniquePlayers = (games) => {
		const uniquePlayers = {};


		games.forEach(game => {
			game.forEach(player => {
				// Add the player to the object using steamid as the key to ensure uniqueness
				if (!uniquePlayers[player.steamid]) {
					uniquePlayers[player.steamid] = {
						name: getName(player),
						steamid: player.steamid
					};
				}
			});
		});

		// Convert the object back into an array
		return Object.values(uniquePlayers);
	}

	const removeBestAndWorstTenPercent = (array) => {
		if (array.length < 10) {
			return array;
		} else {
			array = array.sort((a, b) => b.hltvRating - a.hltvRating)
			const removeCount = Math.floor(array.length * 0.1);
			const newArray = array.slice(removeCount, -1 * removeCount)
			return array.slice(removeCount, -1 * removeCount)
		};
	}

	const calculateAvgHLTVRating = (array) => {
		array = array.sort((a, b) => b.hltvRating - a.hltvRating)
		console.log(array.map(stat => stat.hltvRating))
		console.log(removeBestAndWorstTenPercent(array).map(stat => stat.hltvRating))
		return removeBestAndWorstTenPercent(array).reduce((total, stat) => total + stat.hltvRating, 0) / removeBestAndWorstTenPercent(array).length
	}

	const playerStats = []
	const playerList = getUniquePlayers(await fetchMatches().then(matches => matches.map(match => match.playerStats))).filter(player => !["76561198413151187"].includes(player.steamid));

	playerList.forEach(player => {
		const mapStats = []

		matchData.forEach(match => {
			const playerMatchData = match.playerStats.find(playerStat => playerStat.steamid === player.steamid)

			if (playerMatchData) {
				const kpr = playerMatchData.kills_total / match.rounds.length
				const dpr = playerMatchData.deaths_total / match.rounds.length
				const apr = playerMatchData.assists_total / match.rounds.length
				const adr = playerMatchData.damage_total / match.rounds.length
				const deaths = playerMatchData.deaths_total
				const survivalRate = (match.rounds.length - deaths) / match.rounds.length
				const impact = calculateImpact(playerMatchData)

				const playerTeam = match.playerStats.find(playerStat => playerStat.steamid === player.steamid)?.team_number

				const winningTeam = match.rounds[match.rounds.length - 1].teamOneScore > match.rounds[match.rounds.length - 1].teamTwoScore ? 2 : 3

				const isWinningTeam = playerTeam === winningTeam

				const rawHltv = { kpr, dpr, apr, impact, adr, survivalRate }

				const winner = match.rounds[match.rounds.length - 1].teamOneScore > match.rounds[match.rounds.length - 1].teamTwoScore ? 2 : 3

				const didPlayerWin = playerTeam === winner

				const hltvRating = calculateHLTVRating(kpr, dpr, apr, impact, adr, survivalRate)
				mapStats.push({ ...playerMatchData, rawHltv, hltvRating, isWinningTeam, hltvRatingRaw: { kpr, dpr, apr, impact, adr, survivalRate, rounds: match.playerStats.length }, timestamp: match.lobbyInfo.timestamp, matchId: match.lobbyInfo.id, map: match.lobbyInfo.map_name, didPlayerWin, rounds: match.rounds.length, teamOneScore: match.rounds[match.rounds.length - 1].teamOneScore, teamTwoScore: match.rounds[match.rounds.length - 1].teamTwoScore })
			}
		})

		const allHltvRatings = mapStats.map(stat => stat.hltvRating).sort((a, b) => b - a)
		// get hltv rating without the most recent game, most recent is the game with the highest timestamp

		const playerInMostRecent = matchData.reduce((maxObj, currentObj) => {
			return currentObj.lobbyInfo.timestamp > maxObj.lobbyInfo.timestamp
				? currentObj
				: maxObj;
		}).playerStats.filter(playerStat => playerStat.steamid === player.steamid).length > 0

		let oldHltvRatings;
		if (playerInMostRecent) {
			oldHltvRatings = removeBestAndWorstTenPercent(mapStats.slice().sort((a, b) => a.timestamp - b.timestamp).slice(0, -1)).map(stat => stat.hltvRating).sort((a, b) => b - a)
		} else {
			oldHltvRatings = removeBestAndWorstTenPercent(mapStats.slice().sort((a, b) => a.timestamp - b.timestamp)).map(stat => stat.hltvRating).sort((a, b) => b - a)
		}

		const hltvRatings = removeBestAndWorstTenPercent(mapStats).map(stat => stat.hltvRating).sort((a, b) => b - a)

		playerStats.push({
			mapStats: mapStats.sort((a, b) => b.timestamp - a.timestamp),
			...player,
			rawHltv: {
				kpr: mapStats.reduce((total, stat) => total + stat.rawHltv.kpr, 0) / mapStats.length,
				dpr: mapStats.reduce((total, stat) => total + stat.rawHltv.dpr, 0) / mapStats.length,
				apr: mapStats.reduce((total, stat) => total + stat.rawHltv.apr, 0) / mapStats.length,
				impact: mapStats.reduce((total, stat) => total + stat.rawHltv.impact, 0) / mapStats.length,
				adr: mapStats.reduce((total, stat) => total + stat.rawHltv.adr, 0) / mapStats.length,
				survivalRate: mapStats.reduce((total, stat) => total + stat.rawHltv.survivalRate, 0) / mapStats.length
			},
			kills: mapStats.reduce((total, stat) => total + stat.kills_total, 0),
			deaths: mapStats.reduce((total, stat) => total + stat.deaths_total, 0),
			assists: mapStats.reduce((total, stat) => total + stat.assists_total, 0),
			avg_hltvRating: hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length,
			old_avg_hltvRating: oldHltvRatings.reduce((total, stat) => total + stat, 0) / oldHltvRatings.length,
			old_hltv_ratings: oldHltvRatings,
			hltv_ratings: hltvRatings,
			all_hltv_ratings: allHltvRatings,
			ratingChange: hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length - removeBestAndWorstTenPercent(mapStats.slice().sort((a, b) => a.timestamp - b.timestamp).slice(0, -1)).map(stat => stat.hltvRating).sort((a, b) => b - a).reduce((total, stat) => total + stat, 0) / oldHltvRatings.length
		})
	})

	const hltvTimeline = []
	const tempTimeline = []
	playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.reverse().forEach(stat => {
		tempTimeline.push({
			hltvRating: stat.hltvRating,
			timestamp: stat.timestamp,
			matchId: stat.matchId,
			kills: stat.kills_total,
			deaths: stat.deaths_total,
			assists: stat.assists_total,
			adr: stat.rawHltv.adr
		})
		hltvTimeline.push({
			rating: calculateAvgHLTVRating(tempTimeline),
			currentMatch: {
				hltvRating: stat.hltvRating,
				timestamp: stat.timestamp,
				matchId: stat.matchId,
				kills: stat.kills_total,
				deaths: stat.deaths_total,
				assists: stat.assists_total,
				adr: stat.rawHltv.adr
			}
		})
	})

	const maps = Array.from(new Set(playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.map((x) => x.map))).sort()

	const mapStats = []
	maps.forEach((map) => {
		const wins = playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map && x.didPlayerWin).length
		const matchesPlayed = playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).length
		mapStats.push({
			name: getMapString(map),
			matches: playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).length,
			winRate: ((wins / matchesPlayed) * 100).toFixed(0) + " %",
			avgKills: (playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).reduce((total, stat) => total + stat.kills_total, 0) / matchesPlayed).toFixed(1),
			avgDeaths: (playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).reduce((total, stat) => total + stat.deaths_total, 0) / matchesPlayed).toFixed(1),
			avgAssists: (playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).reduce((total, stat) => total + stat.assists_total, 0) / matchesPlayed).toFixed(1),
			avgAdr: (playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).reduce((total, stat) => total + stat.rawHltv.adr, 0) / matchesPlayed).toFixed(0),
			avgRating: (playerStats.find(playerStat => playerStat.steamid === params.playerId).mapStats.filter((x) => x.map === map).reduce((total, stat) => total + stat.hltvRating, 0) / matchesPlayed).toFixed(2)
		})
	})

	return {
		hltvTimeline: hltvTimeline,
		stats: playerStats.find(playerStat => playerStat.steamid === params.playerId),
		maps: mapStats.sort((a, b) => b.matches - a.matches)
	}
}

