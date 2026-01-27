import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists } from '$lib/server/mongodb';

const log = (message: string) => {
	const date = new Date().toISOString();
	console.log(`[${date}] ${message}`);
};

const logError = (message: string, error: unknown) => {
	const date = new Date().toISOString();
	console.error(`[${date}] ${message}`, error);
};

export const GET: RequestHandler = async () => {
	return json({
		uploadUrl: '/api/upload',
		uploadMultipleUrl: '/api/upload'
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const files = formData.getAll('replays');

	log(`Received ${files.length} file(s) for upload`);

	if (files.length === 0) {
		return json({ reason: 'No files provided' }, { status: 400 });
	}

	const demosDir = '/tmp/demos';
	log(`Demos directory: ${demosDir}`);

	try {
		await fs.mkdir(demosDir, { recursive: true });
		log(`Created/verified demos directory`);
	} catch (error) {
		logError('Failed to create demos directory', error);
		return json(
			{ reason: 'Failed to create storage directory', error: String(error) },
			{ status: 500 }
		);
	}

	try {
		await connectToDatabase();
		log('Connected to MongoDB');
	} catch (error) {
		logError('Failed to connect to MongoDB', error);
		return json({ reason: 'Database connection failed', error: String(error) }, { status: 500 });
	}

	const results = [];

	for (const file of files) {
		if (file instanceof File) {
			const filename = file.name.replace('.dem', '');

			try {
				const exists = await matchExists(filename);
				if (exists) {
					log(`Skipping replay ${filename}: Already exists in MongoDB`);
					results.push({ id: file.name, status: 'skipped', reason: 'Already exists in MongoDB' });
					continue;
				}

				const filePath = path.join(demosDir, `${filename}.dem`);
				log(`Saving replay ${filename}.dem to ${filePath}...`);
				const buffer = await file.arrayBuffer();
				await fs.writeFile(filePath, Buffer.from(buffer));
				log(`Successfully saved ${filename}.dem (${buffer.byteLength} bytes)`);

				log(`Parsing replay ${filename}...`);
				const parsedData = parseReplay(filename);
				log(`Successfully parsed ${filename}`);

				log(`Inserting match ${filename} into MongoDB...`);
				await insertMatch(parsedData);
				log(`Successfully processed replay ${filename}`);
				results.push({ id: file.name, status: 'processed' });
			} catch (error) {
				logError(`Error processing replay ${filename}`, error);
				results.push({ id: file.name, status: 'failed', reason: (error as Error).message });
			}
		}
	}

	return json({ results });
};
