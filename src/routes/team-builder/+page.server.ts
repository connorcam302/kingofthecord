
import { calculateHLTVRating, calculateImpact } from '$lib/utils';

export const load = async ({ params }) => {
	const matchIds = async () => {
		const matchIds = await import('$lib/server/matches/matchIds.json');
		return matchIds.default;
	}

	const fetchMatches = async () => {
		const matchIdArray = await matchIds();

		const matches = [];
		for (const matchId of matchIdArray) {
			const match = await import(`$lib/server/matches/${matchId}.json`);
			matches.push(match.default);
		}
		return matches;
	}

	const matchData = await fetchMatches();

	// Function to extract unique players with their steamid
	const getUniquePlayers = (games) => {
		const uniquePlayers = {};

		console.log(games.length)

		games.forEach(game => {
			console.log(game)
			game.forEach(player => {
				// Add the player to the object using steamid as the key to ensure uniqueness
				if (!uniquePlayers[player.steamid]) {
					uniquePlayers[player.steamid] = {
						name: player.name,
						steamid: player.steamid
					};
				}
			});
		});

		// Convert the object back into an array
		return Object.values(uniquePlayers);
	}

	const playerStats = []
	const playerList = getUniquePlayers(await fetchMatches().then(matches => matches.map(match => match.playerStats))).filter(player => !["76561198413151187", "76561198288678612", "76561198190151814"].includes(player.steamid));

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
				mapStats.push({ ...playerMatchData, rawHltv, hltvRating, isWinningTeam, hltvRatingRaw: { kpr, dpr, apr, impact, adr, survivalRate, rounds: match.playerStats.length } })
			}
		})

		playerStats.push({
			mapStats,
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
			avg_hltvRating: mapStats.reduce((total, stat) => total + stat.hltvRating, 0) / mapStats.length
		})
	})

	return {
		playerStats
	};
}
