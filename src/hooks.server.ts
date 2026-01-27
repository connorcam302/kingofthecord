import type { Handle } from '@sveltejs/kit';
import { createLogger } from '$lib/server/logger';

const log = createLogger('hooks');

export const handle: Handle = async ({ event, resolve }) => {
	log.info(`${event.request.method} ${event.url.pathname}`);
	return resolve(event);
};
