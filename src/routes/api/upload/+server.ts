import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parseReplay } from '$lib/utils/parseReplay';
import { connectToDatabase, insertMatch, matchExists } from '$lib/server/mongodb';

export const GET: RequestHandler = async () => {
	return json({
		uploadUrl: '/api/upload',
		uploadMultipleUrl: '/api/upload'
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const files = formData.getAll('replays');

	if (files.length === 0) {
		return json({ reason: 'No files provided' }, { status: 400 });
	}

	const demosDir = path.resolve(process.cwd(), 'src/lib/demos');
	await fs.mkdir(demosDir, { recursive: true });

	await connectToDatabase();

	const results = [];

	for (const file of files) {
		if (file instanceof File) {
			const filename = file.name.replace('.dem', '');
			const filePath = path.join(demosDir, `${filename}.dem`);

			try {
				const buffer = await file.arrayBuffer();
				await fs.writeFile(filePath, Buffer.from(buffer));

				const exists = await matchExists(filename);
				if (exists) {
					results.push({ id: file.name, status: 'skipped', reason: 'Already exists in MongoDB' });
					continue;
				}

				const parsedData = parseReplay(filename);
				await insertMatch(parsedData);
				results.push({ id: file.name, status: 'processed' });
			} catch (error) {
				results.push({ id: file.name, status: 'failed', reason: (error as Error).message });
			}
		}
	}

	return json({ results });
};
