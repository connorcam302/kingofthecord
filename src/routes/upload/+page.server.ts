import { type RequestHandler } from '@sveltejs/kit';

export const load = async () => {
	return {
		uploadUrl: '/api/upload',
		uploadMultipleUrl: '/api/upload'
	};
};
