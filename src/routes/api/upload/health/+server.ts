import { json, type RequestHandler } from '@sveltejs/kit';

const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || 'http://localhost:7776';

export const GET: RequestHandler = async () => {
	try {
		const response = await fetch(`${UPLOAD_SERVICE_URL}/health`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		if (response.ok) {
			const upstreamHealth = await response.json();
			return json({
				status: 'healthy',
				upstream: upstreamHealth
			});
		}

		return json(
			{
				status: 'unhealthy',
				upstream: { status: 'unreachable', code: response.status }
			},
			{ status: 503 }
		);
	} catch (error) {
		return json(
			{
				status: 'unhealthy',
				upstream: { status: 'unreachable', error: (error as Error).message }
			},
			{ status: 503 }
		);
	}
};
