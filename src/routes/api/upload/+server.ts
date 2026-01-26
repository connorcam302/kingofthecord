import { json, type RequestHandler } from '@sveltejs/kit';

const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || 'http://localhost:7776';

export const GET: RequestHandler = async () => {
	return json({
		uploadUrl: `${UPLOAD_SERVICE_URL}/upload`,
		uploadMultipleUrl: `${UPLOAD_SERVICE_URL}/upload/multiple`
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const files = formData.getAll('replays');

	const uploadFormData = new FormData();
	for (const file of files) {
		uploadFormData.append('replays', file);
	}

	const response = await fetch(`${UPLOAD_SERVICE_URL}/upload/multiple`, {
		method: 'POST',
		body: uploadFormData
	});

	const result = await response.json();
	return json(result, { status: response.status });
};
