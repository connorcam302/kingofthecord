
import { fetchMatches } from '$lib/server/privateUtils';
import { calculateHLTVRating, calculateImpact, getName } from '$lib/utils';

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

				const hltvRating = calculateHLTVRating(kpr, dpr, apr, impact, adr, survivalRate)
				mapStats.push({ ...playerMatchData, rawHltv, hltvRating, isWinningTeam, hltvRatingRaw: { kpr, dpr, apr, impact, adr, survivalRate, rounds: match.playerStats.length }, timestamp: match.lobbyInfo.timestamp, map: match.lobbyInfo.map_name })
			}
		})

		const allHltvRatings = mapStats.map(stat => stat.hltvRating).sort((a, b) => b - a)

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

		const formGames = mapStats.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
		const form = (formGames.reduce((total, stat) => total + stat.hltvRating, 0) / formGames.length).toFixed(2)

		const headshotPercentage = ((mapStats.reduce((total, stat) => total + stat.headshot_kills_total, 0) / mapStats.reduce((total, stat) => total + stat.kills_total, 0)) * 100).toFixed(1)

		const getHighestAndLowestAvgRating = (mapStats) => {
			const mapRatings = {};

			// Group hltvRating by map
			mapStats.forEach(match => {
				const mapName = match.map;
				if (!mapRatings[mapName]) {
					mapRatings[mapName] = { totalRating: 0, count: 0 };
				}
				mapRatings[mapName].totalRating += match.hltvRating;
				mapRatings[mapName].count += 1;
			});

			// Calculate average ratings
			const avgRatings = Object.entries(mapRatings).map(([map, data]) => ({
				map,
				avgRating: data.totalRating / data.count
			}));

			// Find highest and lowest average rating
			const highestMap = avgRatings.reduce((a, b) => (a.avgRating > b.avgRating ? a : b)).map;
			const lowestMap = avgRatings.reduce((a, b) => (a.avgRating < b.avgRating ? a : b)).map;

			return { highestMap, lowestMap };
		}

		const { highestMap, lowestMap } = getHighestAndLowestAvgRating(mapStats)

		playerStats.push({
			mapStats: mapStats.sort((a, b) => b.timestamp - a.timestamp),
			...player,
			kpr: (mapStats.reduce((total, stat) => total + stat.rawHltv.kpr, 0) / mapStats.length),
			dpr: (mapStats.reduce((total, stat) => total + stat.rawHltv.dpr, 0) / mapStats.length),
			apr: (mapStats.reduce((total, stat) => total + stat.rawHltv.apr, 0) / mapStats.length),
			impact: (mapStats.reduce((total, stat) => total + stat.rawHltv.impact, 0) / mapStats.length),
			adr: (mapStats.reduce((total, stat) => total + stat.rawHltv.adr, 0) / mapStats.length),
			adr: (mapStats.reduce((total, stat) => total + stat.rawHltv.adr, 0) / mapStats.length),
			kills: (mapStats.reduce((total, stat) => total + stat.kills_total, 0) / mapStats.length),
			deaths: (mapStats.reduce((total, stat) => total + stat.deaths_total, 0) / mapStats.length),
			assists: (mapStats.reduce((total, stat) => total + stat.assists_total, 0) / mapStats.length),
			flashes: (mapStats.reduce((total, stat) => total + stat.enemies_flashed_total, 0) / mapStats.length),
			utilityDamage: (mapStats.reduce((total, stat) => total + stat.utility_damage_total, 0) / mapStats.length),
			winRate: (mapStats.reduce((total, stat) => total + stat.isWinningTeam, 0) / mapStats.length * 100),
			matches: mapStats.length,
			headshotPercentage,
			avg_hltvRating: (hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length),
			old_avg_hltvRating: oldHltvRatings.reduce((total, stat) => total + stat, 0) / oldHltvRatings.length,
			old_hltv_ratings: oldHltvRatings,
			hltv_ratings: hltvRatings,
			all_hltv_ratings: allHltvRatings,
			ratingChange: hltvRatings.reduce((total, stat) => total + stat, 0) / hltvRatings.length - removeBestAndWorstTenPercent(mapStats.slice().sort((a, b) => a.timestamp - b.timestamp).slice(0, -1)).map(stat => stat.hltvRating).sort((a, b) => b - a).reduce((total, stat) => total + stat, 0) / oldHltvRatings.length,
			form,
			// matches are stored in mapStats, every mapStats has a map, map.map, get the players average rating for each map and retrn the highest and lowest average rating map
			highestMap,
			lowestMap
		})
	})

	return {
		matchData,
		playerStats
	};
}
