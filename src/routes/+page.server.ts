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
	const playerList = getUniquePlayers(await fetchMatches().then(matches => matches.map(match => match.playerStats))).filter(player => !["76561198269258902", "76561198979060238", "76561198413151187"].includes(player.steamid));

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
				mapStats.push({ ...playerMatchData, rawHltv, hltvRating, isWinningTeam, hltvRatingRaw: { kpr, dpr, apr, impact, adr, survivalRate, rounds: match.playerStats.length }, timestamp: match.lobbyInfo.timestamp })
			}
		})

		console.log(player.name)

		const allHltvRatings = mapStats.map(stat => stat.hltvRating).sort((a, b) => b - a)
		// get hltv rating without the most recent game, most recent is the game with the highest timestamp
		const oldHltvRatings = removeBestAndWorstTenPercent(mapStats.slice().sort((a, b) => a.timestamp - b.timestamp).slice(0, -1)).map(stat => stat.hltvRating).sort((a, b) => b - a)

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
			all_hltv_ratings: allHltvRatings
		})
	})

	return {
		matchIds: await matchIds(),
		matchData,
		playerStats
	};
}
