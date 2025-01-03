import { listGameEvents, parseEvent, parseEvents, parseHeader, parsePlayerInfo, parseTicks } from '@laihoe/demoparser2';
import path from 'path';

export interface DamageEvent {
	armor: number
	attacker_name: string
	attacker_steamid: string
	dmg_armor: number
	dmg_health: number
	event_name: string
	health: number
	hitgroup: string
	tick: number
	user_name: string
	user_steamid: string
	weapon: string
}

export const parseReplay = (id: string) => {
	const filePath = path.resolve(process.cwd(), `src/lib/demos/${id}.dem`).toString();

	const gameEndTick = Math.max(...parseEvent(filePath, "round_end").map(x => x.tick))

	const fields = ["kills_total", "deaths_total", "mvps", "headshot_kills_total", "score", "assists_total", "alive_time_total"]
	const scoreboard = parseTicks(filePath, fields, [gameEndTick])

	const playerInfo = parsePlayerInfo(filePath)
	const lobbyInfo = parseHeader(filePath)
	const damageEvents: DamageEvent[] = parseEvents(filePath, ['player_death', 'player_hurt'])

	const roundTimers = parseEvents(filePath, ['round_prestart', 'cs_win_panel_match'])
	const captainOne = playerInfo[0]
	const captainTwo = playerInfo.find(x => x.team_number !== captainOne.team_number)

	const rounds = roundTimers.map((x: any, i: number) => {
		return {
			round: i + 1,
			start: x.tick,
			end: roundTimers[i + 1] ? roundTimers[i + 1].tick - 1 : null,
		}
	})

	for (let i = 0; i < rounds.length; i++) {
		const roundDamageEvents = damageEvents.filter(x => x.tick >= rounds[i].start && x.tick <= rounds[i].end)
		rounds[i] = {
			...rounds[i],
			teamOneScore: parseTicks(filePath, ['team_rounds_total'], [rounds[i].start]).find(x => x.steamid === captainOne.steamid).team_rounds_total,
			teamTwoScore: parseTicks(filePath, ['team_rounds_total'], [rounds[i].start]).find(x => x.steamid === captainTwo.steamid).team_rounds_total,
			damage: playerInfo.map(attacker => {
				const damageDealt = roundDamageEvents.filter(x => x.attacker_steamid === attacker.steamid)
				const enemyTeam = playerInfo.filter(x => x.team_number !== attacker.team_number)

				const damageToEachPlayer = enemyTeam.map(defender => {
					const damageDealtToDefender = damageDealt.filter(x => x.user_steamid === defender.steamid)

					// const create an array that contains the total damage dealt to each player
					return {
						damage: damageDealtToDefender.reduce((acc, x) => acc + x.dmg_health, 0),
						defender: defender.steamid,
						defenderName: defender.name,
						killed: damageDealtToDefender.some(x => x.event_name === 'player_death'),
						killWeapon: damageDealtToDefender.find(x => x.event_name === 'player_death')?.weapon,
						events: damageDealtToDefender.map(damage => {
							return {
								dmg_health: damage.dmg_health,
								event_name: damage.event_name,
								hitgroup: damage.hitgroup,
								tick: damage.tick,
								weapon: damage.weapon
							}
						})
					}

				})

				return {
					attacker_name: attacker.name,
					attacker_steamid: attacker.steamid,
					team: attacker.team_number,
					// remove null values
					damage_dealt: damageToEachPlayer.filter(x => x)
				}
			})


		}
		rounds[i - 1] = {
			...rounds[i - 1],
			winner: rounds[i].teamOneScore > rounds[i].teamTwoScore ? 'teamOne' : 'teamTwo'
		}
	}

	const killstreaks = (steamid: string, amount: number) => {
		let count = 0;
		for (let i = 0; i < rounds.length; i++) {
			const round = rounds[i];
			const damage = round.damage.find(x => x.attacker_steamid === steamid);
			if (damage && damage.damage_dealt.filter(x => x.killed).length >= amount) {
				count++;
			}
		}
		return count;
	}
	const playerStats = playerInfo.map(x => {
		return {
			...x,
			oneK: killstreaks(x.steamid, 1),
			twoK: killstreaks(x.steamid, 2),
			threeK: killstreaks(x.steamid, 3),
			fourK: killstreaks(x.steamid, 4),
			fiveK: killstreaks(x.steamid, 5),
			...scoreboard.find(y => y.steamid === x.steamid)
		}
	})

	return {
		lobbyInfo,
		playerStats,
		rounds
	}
}
