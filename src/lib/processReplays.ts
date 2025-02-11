import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from './utils/parseReplay'; // Import your parseReplay function
import dayjs from 'dayjs';

//print a log with a timestamp
const printLog = (message: string) => {
	const date = new Date().toISOString()
	console.log(`[${date}] ${message}`);
}

const processReplays = async () => {
	const demosDir = path.resolve(process.cwd(), 'src/lib/demos');
	const matchesDir = path.resolve(process.cwd(), 'src/lib/server/matches');

	try {
		await fs.mkdir(matchesDir, { recursive: true });
		const files = await fs.readdir(demosDir);

		const results = [];

		for (const file of files) {
			if (path.extname(file) === '.dem') {
				const id = path.basename(file, '.dem');
				const outputFilePath = path.join(matchesDir, `${id}.json`);

				try {
					await fs.access(outputFilePath);
					printLog(`Skipping replay ID ${id}: JSON file already exists.`);
					results.push({ id, status: 'skipped', reason: 'JSON file already exists' });
					continue;
				} catch { }

				try {
					printLog(`Parsing replay with ID ${id}...`);
					const parsedData = parseReplay(id);

					if (typeof parsedData === 'object' && parsedData !== null) {
						await fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2), 'utf-8');
						printLog(`Successfully wrote JSON for replay ID ${id}.`);
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
		const matchFiles = await fs.readdir(matchesDir);

		const ids = [];
		for (const file of matchFiles) {
			if (path.basename(file) !== 'matchIds.json') {
				const id = path.basename(file, '.json');
				ids.push(id);
			}
		}

		await fs.writeFile(path.join(matchesDir, `matchIds.json`), JSON.stringify(ids, null, 2), 'utf-8');

		printLog('Replay processing complete.');
	} catch (error: any) {
		printLog(`Error in replay processing endpoint: ${error}`);
	}
}

processReplays();
