import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists, getAllMatchIds } from '$lib/server/mongodb';

export const POST: RequestHandler = async () => {
	const demosDir = path.resolve(process.cwd(), 'src/lib/demos');

	try {
		await connectToDatabase();
		const files = await fs.readdir(demosDir);

		const results = [];

		for (const file of files) {
			if (path.extname(file) === '.dem') {
				const id = path.basename(file, '.dem');

				try {
					const exists = await matchExists(id);
					if (exists) {
						console.log(`Skipping replay ID ${id}: Already exists in MongoDB.`);
						results.push({ id, status: 'skipped', reason: 'Already exists in MongoDB' });
						continue;
					}
				} catch (error) {
					console.error(`Error checking if match exists for ID ${id}:`, error);
				}

				try {
					console.log(`Parsing replay with ID ${id}...`);
					const parsedData = parseReplay(id);

					if (typeof parsedData === 'object' && parsedData !== null) {
						await insertMatch(parsedData, 2);
						console.log(`Successfully stored match ${id} in MongoDB.`);
						results.push({ id, status: 'processed', reason: null });
					} else {
						console.error(`Invalid parsed data for replay ID ${id}:`, parsedData);
						results.push({ id, status: 'failed', reason: 'Invalid parsed data' });
					}
				} catch (error) {
					console.error(`Error processing replay ID ${id}:`, error);
					results.push({ id, status: 'failed', reason: error.message });
				}
			}
		}

		const allMatchIds = await getAllMatchIds();

		return json({
			message: 'Replay processing complete',
			results,
			totalMatches: allMatchIds.length
		});
	} catch (error) {
		console.error('Error in replay processing endpoint:', error);
		return json({ error: 'Failed to process replays', details: error.message }, { status: 500 });
	}
};
