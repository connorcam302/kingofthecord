import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay'; // Import your parseReplay function

export const POST: RequestHandler = async () => {
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
					console.log(`Skipping replay ID ${id}: JSON file already exists.`);
					results.push({ id, status: 'skipped', reason: 'JSON file already exists' });
					continue;
				} catch { }

				try {
					console.log(`Parsing replay with ID ${id}...`);
					const parsedData = parseReplay(id);

					console.log(parsedData);

					// Check the parsed data type and structure for debugging
					console.log(`Type of parsedData:`, typeof parsedData); // Should be 'object'
					console.log(`Contents of parsedData:`, parsedData);

					// Ensure parsedData is an object before writing to file
					if (typeof parsedData === 'object' && parsedData !== null) {
						console.log(`Writing JSON to ${outputFilePath}`);
						await fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2), 'utf-8');
						console.log(`Successfully wrote JSON for replay ID ${id}.`);
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

		return json({ message: 'Replay processing complete', results });
	} catch (error) {
		console.error('Error in replay processing endpoint:', error);
		return json({ error: 'Failed to process replays', details: error.message }, { status: 500 });
	}
};

