import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists, getUserBySteamid } from '$lib/server/mongodb';
import { createLogger } from '$lib/server/logger';

const log = createLogger('api-upload');

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};

export const GET: RequestHandler = async () => {
	log.info('Health check for upload API');
	return json({
		uploadUrl: '/api/upload',
		uploadMultipleUrl: '/api/upload'
	});
};

export const POST: RequestHandler = async ({ request }) => {
	log.info('route hit');
	const contentType = request.headers.get('content-type') || '';

	if (!contentType.includes('multipart/form-data')) {
		return json({ reason: 'Expected multipart/form-data' }, { status: 400 });
	}

	const formData = await request.formData();
	const files = formData.getAll('replays');

	log.info({ fileCount: files.length }, 'Received files for upload');

	if (files.length === 0) {
		return json({ reason: 'No files provided' }, { status: 400 });
	}

	const demosDir = '/tmp/demos';

	try {
		await fs.mkdir(demosDir, { recursive: true });
		log.info('Created/verified demos directory');
	} catch (error) {
		log.error({ error }, 'Failed to create demos directory');
		return json(
			{ reason: 'Failed to create storage directory', error: String(error) },
			{ status: 500 }
		);
	}

	try {
		await connectToDatabase();
		log.info('Connected to MongoDB');
	} catch (error) {
		log.error({ error }, 'Failed to connect to MongoDB');
		return json({ reason: 'Database connection failed', error: String(error) }, { status: 500 });
	}

	const results: Array<{ id: string; status: string; reason?: string }> = [];
	const newPlayers: Array<{ steamid: string; name: string }> = [];
	const processedSteamids = new Set<string>();

	for (const file of files) {
		if (file instanceof File) {
			const filename = file.name.replace('.dem', '');

			try {
				const exists = await matchExists(filename);
				if (exists) {
					log.info({ filename }, 'Skipping replay: Already exists in MongoDB');
					results.push({ id: file.name, status: 'skipped', reason: 'Already exists in MongoDB' });
					continue;
				}

				const filePath = path.join(demosDir, `${filename}.dem`);
				log.info({ filename, filePath }, 'Saving replay file');
				const buffer = await file.arrayBuffer();
				await fs.writeFile(filePath, Buffer.from(buffer));
				log.info({ filename, bytes: buffer.byteLength }, 'Successfully saved replay file');

				log.info({ filename }, 'Parsing replay');
				const parsedData = parseReplay(filename);
				log.info({ filename }, 'Successfully parsed replay');

				for (const player of parsedData.playerStats) {
					if (!processedSteamids.has(player.steamid)) {
						processedSteamids.add(player.steamid);
						const existingUser = await getUserBySteamid(player.steamid);
						if (!existingUser) {
							newPlayers.push({ steamid: player.steamid, name: player.name });
						}
					}
				}

				log.info({ filename }, 'Inserting match into MongoDB');
				await insertMatch(parsedData);
				log.info({ filename }, 'Successfully processed replay');

				log.info({ filename, filePath }, 'Deleting demo file');
				await fs.unlink(filePath);
				log.info({ filename }, 'Deleted demo file');

				results.push({ id: file.name, status: 'processed' });
			} catch (error) {
				log.error({ filename, error }, 'Error processing replay');
				results.push({ id: file.name, status: 'failed', reason: (error as Error).message });
			}
		}
	}

	return json(
		{ results, newPlayers },
		{
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		}
	);
};
