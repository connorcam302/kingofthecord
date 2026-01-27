import { json, type RequestHandler } from '@sveltejs/kit';
import { createLogger } from '$lib/server/logger';

const log = createLogger('health');

export const GET: RequestHandler = async () => {
	log.info('Health check received');
	return json({
		status: 'healthy',
		service: 'upload'
	});
};
