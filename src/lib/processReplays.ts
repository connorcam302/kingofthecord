import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from './utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists } from './server/mongodb';
import { createLogger } from './server/logger';

const log = createLogger('processReplays');

const processReplays = async () => {
	const demosDir = path.resolve(process.cwd(), 'src/lib/demos');

	try {
		await connectToDatabase();
		const files = await fs.readdir(demosDir);

		log.info({ dir: demosDir, fileCount: files.length }, 'Reading demos directory');

		const results = [];

		for (const file of files) {
			if (path.extname(file) === '.dem') {
				const id = path.basename(file, '.dem');

				try {
					const exists = await matchExists(id);
					if (exists) {
						log.info({ id }, 'Skipping replay: Already exists in MongoDB');
						results.push({ id, status: 'skipped', reason: 'Already exists in MongoDB' });
						continue;
					}
				} catch (error) {
					log.error({ id, error }, 'Error checking if match exists');
				}

				try {
					log.info({ id }, 'Parsing replay');
					const parsedData = parseReplay(id);

					if (typeof parsedData === 'object' && parsedData !== null) {
						await insertMatch(parsedData);
						log.info({ id }, 'Successfully stored match in MongoDB');
						results.push({ id, status: 'processed', reason: null });
					} else {
						log.warn({ id, parsedData }, 'Invalid parsed data for replay');
						results.push({ id, status: 'failed', reason: 'Invalid parsed data' });
					}
				} catch (error) {
					log.error({ id, error }, 'Error processing replay');
					results.push({ id, status: 'failed', reason: (error as Error).message });
				}
			}
		}

		log.info({ processedCount: results.length }, 'Replay processing complete');
	} catch (error) {
		log.error({ error }, 'Error in replay processing');
	}
};

processReplays();
