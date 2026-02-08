import { json } from '@sveltejs/kit';
import { upsertUser, getUserBySteamid } from '$lib/server/mongodb';

export async function POST({ request }: { request: Request }) {
	try {
		const { steamid, displayName, nickname } = await request.json();

		if (!steamid || !displayName) {
			return json({ error: 'steamid and displayName are required' }, { status: 400 });
		}

		const existingUser = await getUserBySteamid(steamid);
		if (existingUser) {
			return json({ error: 'User already exists', user: existingUser }, { status: 409 });
		}

		await upsertUser(steamid, displayName, { nickname });
		return json({ success: true, steamid });
	} catch (error) {
		return json({ error: String(error) }, { status: 500 });
	}
}
