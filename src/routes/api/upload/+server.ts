import { json, type RequestHandler } from '@sveltejs/kit';
import { listGameEvents, parseEvent, parseEvents, parseTicks } from '@laihoe/demoparser2';

export const POST: RequestHandler = async ({ request }) => {

	const filePath = "/home/connor/kingofthecord/src/lib/demos/003727523440987472050_2055487250.dem"

	const gameEndTick = Math.max(...parseEvent(filePath, "round_end").map(x => x.tick))

	const fields = ["kills_total", "deaths_total", "mvps", "headshot_kills_total", "ace_rounds_total", "score", "assists_total", "alive_time_total", "4k_rounds_total", "3k_rounds_total"]
	const scoreboard = parseTicks(filePath, fields, [gameEndTick])

	const eventNames = listGameEvents(filePath)

	console.log(eventNames)

	// Currently the event "all" gives you all events. Cursed solution for now
	const allEvents = parseEvents(filePath, ['player_hurt', 'player_death'])

	const roundTimers = parseEvents(filePath, ['round_prestart'])

	return json(roundTimers)

	//return json(scoreboard)
};
