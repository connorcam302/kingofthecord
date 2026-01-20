import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from './utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists } from './server/mongodb';

const printLog = (message: string) => {
	const date = new Date().toISOString();
	console.log(`[${date}] ${message}`);
};

const processReplays = async () => {
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
						printLog(`Skipping replay ID ${id}: Already exists in MongoDB.`);
						results.push({ id, status: 'skipped', reason: 'Already exists in MongoDB' });
						continue;
					}
				} catch (error) {
					printLog(`Error checking if match exists for ID ${id}: ${error}`);
				}

				try {
					printLog(`Parsing replay with ID ${id}...`);
					const parsedData = parseReplay(id);

					if (typeof parsedData === 'object' && parsedData !== null) {
						await insertMatch(parsedData);
						printLog(`Successfully stored match ${id} in MongoDB.`);
						results.push({ id, status: 'processed', reason: null });
					} else {
						printLog(`Invalid parsed data for replay ID ${id}: ${parsedData}`);
						results.push({ id, status: 'failed', reason: 'Invalid parsed data' });
					}
				} catch (error: any) {
					printLog(`Error processing replay ID ${id}: ${error}`);
					results.push({ id, status: 'failed', reason: error.message });
				}
			}
		}

		printLog(`Replay processing complete. Processed ${results.length} replays.`);
	} catch (error: any) {
		printLog(`Error in replay processing: ${error}`);
	}
};

processReplays();
