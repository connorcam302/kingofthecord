import fs from 'fs/promises';
import path from 'path';

export const load = async ({ params }) => {
	const matchIds = async () => {
		const matchesDir = path.resolve(process.cwd(), 'src/lib/server/matches'); // Path to the directory containing match files
		try {
			const files = await fs.readdir(matchesDir);
			const matchIds = files
				.filter(file => path.extname(file) === '.json').map(file => path.basename(file, '.json'));

			return matchIds;
		} catch (error) {
			console.error('Error reading matches directory:', error);
			return [];
		}
	}

	return {
		matchIds: await matchIds()
	};
}
