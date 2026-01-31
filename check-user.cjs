const { MongoClient } = require('mongodb');

async function main() {
	const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
	const dbName = process.env.MONGODB_DB || 'kingofthecord';

	const client = new MongoClient(uri, {
		auth: {
			username: 'mongo',
			password: 'admin'
		}
	});

	try {
		await client.connect();
		const db = client.db(dbName);
		const users = db.collection('users');

		console.log('Looking for user with steamid: 76561198117027334');

		const user = await users.findOne({ steamid: '76561198117027334' });
		console.log('User found:', user);

		if (!user) {
			console.log('\nUser NOT found in database.');
			console.log('This is why they are not showing up as "Eric".');

			console.log('\nLet me check if Eric exists under a different steamid...');
			const ericUser = await users.findOne({
				$or: [{ displayName: 'Eric' }, { nickname: 'Eric' }]
			});
			console.log('Eric user search result:', ericUser);
		}
	} catch (error) {
		console.error('Error:', error.message);
	} finally {
		await client.close();
	}
}

main();
