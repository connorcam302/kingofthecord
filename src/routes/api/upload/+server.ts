import { json, type RequestHandler } from '@sveltejs/kit';
import { parseEvent, parseTicks } from '@laihoe/demoparser2';

export const POST: RequestHandler = async ({ request }) => {

	const headers = {
		'Access-Control-Allow-Origin': '*',  // Allow any origin, or set to a specific origin
		'Access-Control-Allow-Methods': 'POST', // Allowed HTTP methods
		'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
	};

	const formData = await request.formData();
	const file = formData.get('file');

	if (!file) {
		return json({ error: 'No file uploaded' }, { status: 400 });
	}

	//@ts-ignore
	let event_json = parseEvent(file, "player_death", ["X", "Y"], ["total_rounds_played"])
	//@ts-ignore
	let ticks_json = parseTicks(file, ["X", "Y"])

	return json({ event_json, ticks_json }, { headers });
};
