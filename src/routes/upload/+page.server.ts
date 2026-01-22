import { type RequestHandler } from '@sveltejs/kit';

const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3001';

export const load = async () => {
	return {
		uploadUrl: `${UPLOAD_SERVICE_URL}/upload`,
		uploadMultipleUrl: `${UPLOAD_SERVICE_URL}/upload/multiple`
	};
};
