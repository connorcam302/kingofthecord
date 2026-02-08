import { fail } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists, getUserBySteamid } from '$lib/server/mongodb';
import { createLogger } from '$lib/server/logger';

const log = createLogger('upload');

export const load = async () => {
	return {};
};

export const actions = {
	default: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const files = formData.getAll('replays');

		log.info({ fileCount: files.length }, 'Received files for upload');

		if (files.length === 0) {
			return fail(400, { reason: 'No files provided' });
		}

		const demosDir = '/tmp/demos';
		log.info({ demosDir }, 'Using demos directory');

		try {
			await fs.mkdir(demosDir, { recursive: true });
			log.info('Created/verified demos directory');
		} catch (error) {
			log.error({ error }, 'Failed to create demos directory');
			return fail(500, { reason: 'Failed to create storage directory', error: String(error) });
		}

		try {
			await connectToDatabase();
			log.info('Connected to MongoDB');
		} catch (error) {
			log.error({ error }, 'Failed to connect to MongoDB');
			return fail(500, { reason: 'Database connection failed', error: String(error) });
		}

		const results = [];
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
					results.push({ id: file.name, status: 'processed' });
				} catch (error) {
					log.error({ filename, error }, 'Error processing replay');
					results.push({ id: file.name, status: 'failed', reason: (error as Error).message });
				}
			}
		}

		return { results, newPlayers };
	}
};
