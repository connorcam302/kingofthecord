import { MongoClient, type Db, type Collection, ObjectId } from 'mongodb';
import { env } from '$env/dynamic/private';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = env.MONGODB_DB || 'kingofthecord';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
	if (db) return db;

	client = new MongoClient(MONGODB_URI);
	await client.connect();
	db = client.db(MONGODB_DB);
	return db;
}

export async function getMatchesCollection(): Promise<Collection<MatchDocument>> {
	const database = await connectToDatabase();
	return database.collection<MatchDocument>('matches');
}

export interface DamageEvent {
	armor: number;
	attacker_name: string;
	attacker_steamid: string;
	dmg_armor: number;
	dmg_health: number;
	event_name: string;
	health: number;
	hitgroup: string;
	tick: number;
	user_name: string;
	user_steamid: string;
	weapon: string;
}

export interface DamageDealt {
	damage: number;
	defender: string;
	defenderName: string;
	killed: boolean;
	killWeapon?: string;
	events: Array<{
		dmg_health: number;
		event_name: string;
		hitgroup: string;
		tick: number;
		weapon: string;
	}>;
}

export interface RoundDamage {
	attacker_name: string;
	attacker_steamid: string;
	team: number;
	damage_dealt: DamageDealt[];
}

export interface Round {
	round: number;
	start: number;
	end: number | null;
	teamOneScore: number;
	teamTwoScore: number;
	damage: RoundDamage[];
	winner?: 'teamOne' | 'teamTwo';
}

export interface PlayerStats {
	name: string;
	steamid: string;
	team_number: number;
	oneK: number;
	twoK: number;
	threeK: number;
	fourK: number;
	fiveK: number;
	alive_time_total: number;
	assists_total: number;
	damage_total: number;
	deaths_total: number;
	enemies_flashed_total: number;
	headshot_kills_total: number;
	kills_total: number;
	mvps: number;
	score: number;
	tick: number;
	utility_damage_total: number;
}

export interface LobbyInfo {
	addons: string;
	allow_clientside_entities: string;
	allow_clientside_particles: string;
	client_name: string;
	demo_file_stamp: string;
	demo_version_guid: string;
	demo_version_name: string;
	fullpackets_version: string;
	game_directory: string;
	map_name: string;
	network_protocol: string;
	server_name: string;
	id: string;
	timestamp: number;
}

export interface MatchDocument {
	_id?: ObjectId;
	lobbyInfo: LobbyInfo;
	playerStats: PlayerStats[];
	rounds: Round[];
	createdAt: Date;
	season: number;
}

export async function getMatchById(id: string): Promise<Omit<MatchDocument, '_id'> | null> {
	const collection = await getMatchesCollection();
	const doc = await collection.findOne({ 'lobbyInfo.id': id });
	if (!doc) return null;
	const { _id, ...rest } = doc;
	return rest;
}

export async function getAllMatchIds(): Promise<string[]> {
	const collection = await getMatchesCollection();
	const matches = await collection.find({}, { projection: { 'lobbyInfo.id': 1 } }).toArray();
	return matches.map((m) => m.lobbyInfo?.id).filter(Boolean) as string[];
}

export async function getAllMatches(): Promise<Omit<MatchDocument, '_id'>[]> {
	try {
		const collection = await getMatchesCollection();
		const docs = await collection.find({}).toArray();
		return docs.map(({ _id, ...rest }) => rest);
	} catch (error) {
		console.error('Error fetching matches:', error);
		return [];
	}
}

export async function getMatchesBySeason(season: number): Promise<Omit<MatchDocument, '_id'>[]> {
	const collection = await getMatchesCollection();
	const docs = await collection.find({ season }).toArray();
	return docs.map(({ _id, ...rest }) => rest);
}

export async function getLatestSeason(): Promise<number> {
	const collection = await getMatchesCollection();
	const result = await collection
		.aggregate([{ $group: { _id: '$season' } }, { $sort: { _id: -1 } }, { $limit: 1 }])
		.toArray();
	return result[0]?._id || 1;
}

export async function getAllSeasons(): Promise<number[]> {
	const collection = await getMatchesCollection();
	const result = await collection
		.aggregate([{ $group: { _id: '$season' } }, { $sort: { _id: 1 } }])
		.toArray();
	return result.map((r) => r._id).filter(Boolean) as number[];
}

export async function setMatchSeason(id: string, season: number): Promise<void> {
	const collection = await getMatchesCollection();
	await collection.updateOne({ 'lobbyInfo.id': id }, { $set: { season } });
}

export async function insertMatch(
	match: Omit<MatchDocument, '_id' | 'createdAt'>,
	season: number = 2
): Promise<void> {
	const collection = await getMatchesCollection();
	await collection.insertOne({
		...match,
		createdAt: new Date(),
		season
	});
}

export async function matchExists(id: string): Promise<boolean> {
	const collection = await getMatchesCollection();
	const count = await collection.countDocuments({ 'lobbyInfo.id': id });
	return count > 0;
}

export interface UserDocument {
	_id?: ObjectId;
	steamid: string;
	displayName: string;
	nickname?: string;
	avatarUrl?: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
	const database = await connectToDatabase();
	return database.collection<UserDocument>('users');
}

export async function getAllUsers(): Promise<Omit<UserDocument, '_id'>[]> {
	const collection = await getUsersCollection();
	const docs = await collection.find({}).sort({ displayName: 1 }).toArray();
	return docs.map(({ _id, ...rest }) => rest);
}

export async function getActiveUsers(): Promise<Omit<UserDocument, '_id'>[]> {
	const collection = await getUsersCollection();
	const docs = await collection.find({ active: true }).sort({ displayName: 1 }).toArray();
	return docs.map(({ _id, ...rest }) => rest);
}

export async function getInactiveUsers(): Promise<Omit<UserDocument, '_id'>[]> {
	const collection = await getUsersCollection();
	const docs = await collection.find({ active: false }).sort({ displayName: 1 }).toArray();
	return docs.map(({ _id, ...rest }) => rest);
}

export async function getUserBySteamid(steamid: string): Promise<Omit<UserDocument, '_id'> | null> {
	const collection = await getUsersCollection();
	const doc = await collection.findOne({ steamid });
	if (!doc) return null;
	const { _id, ...rest } = doc;
	return rest;
}

export async function getUserName(steamid: string): Promise<string> {
	const user = await getUserBySteamid(steamid);
	if (user) {
		return user.nickname || user.displayName;
	}
	return steamid;
}

export async function isUserActive(steamid: string): Promise<boolean> {
	const collection = await getUsersCollection();
	const count = await collection.countDocuments({ steamid, active: true });
	return count > 0;
}

export async function getActiveSteamids(): Promise<string[]> {
	const collection = await getUsersCollection();
	const docs = await collection.find({ active: true }, { projection: { steamid: 1 } }).toArray();
	return docs.map((d) => d.steamid);
}

export async function upsertUser(
	steamid: string,
	displayName: string,
	options: { nickname?: string; avatarUrl?: string; active?: boolean } = {}
): Promise<void> {
	const collection = await getUsersCollection();
	await collection.updateOne(
		{ steamid },
		{
			$set: {
				steamid,
				displayName,
				nickname: options.nickname,
				avatarUrl: options.avatarUrl,
				active: options.active ?? true,
				updatedAt: new Date()
			},
			$setOnInsert: {
				createdAt: new Date()
			}
		},
		{ upsert: true }
	);
}

export async function setUserActive(steamid: string, active: boolean): Promise<void> {
	const collection = await getUsersCollection();
	await collection.updateOne({ steamid }, { $set: { active, updatedAt: new Date() } });
}

export async function deleteUser(steamid: string): Promise<void> {
	const collection = await getUsersCollection();
	await collection.deleteOne({ steamid });
}

export async function seedUsers(): Promise<void> {
	const users = [
		{ steamid: '76561198122107609', displayName: 'Matthew', nickname: 'Matthew' },
		{ steamid: '76561198254284578', displayName: 'Frenchy', nickname: 'Frenchy' },
		{ steamid: '76561198042044970', displayName: 'Lillie', nickname: 'Lillie' },
		{ steamid: '76561198091576900', displayName: 'Potto', nickname: 'Potto' },
		{ steamid: '76561198066770946', displayName: 'Tom', nickname: 'Tom' },
		{ steamid: '76561198046884782', displayName: 'Connor', nickname: 'Connor' },
		{ steamid: '76561198093204957', displayName: 'Phil', nickname: 'Phil' },
		{ steamid: '76561198070288030', displayName: 'Evan', nickname: 'Evan' },
		{ steamid: '76561198159005292', displayName: 'Sam', nickname: 'Sam' },
		{ steamid: '76561198061148990', displayName: 'Callum', nickname: 'Callum' },
		{ steamid: '76561198092288421', displayName: 'Steve', nickname: 'Steve' },
		{ steamid: '76561198273647139', displayName: 'Brock', nickname: 'Brock' },
		{ steamid: '76561198051802093', displayName: 'Dan', nickname: 'Dan' },
		{ steamid: '76561198040636119', displayName: 'Bingham', nickname: 'Bingham' },
		{ steamid: '76561198061114587', displayName: 'Liam', nickname: 'Liam' },
		{ steamid: '76561198114107073', displayName: 'Pona', nickname: 'Pona' },
		{ steamid: '76561198070364957', displayName: 'Dom', nickname: 'Dom' },
		{ steamid: '76561198413151187', displayName: 'Unknown', nickname: null, active: false },
		{ steamid: '76561198288678612', displayName: 'Unknown', nickname: null, active: false },
		{ steamid: '76561198190151814', displayName: 'Unknown', nickname: null, active: false }
	];

	for (const user of users) {
		await upsertUser(user.steamid, user.displayName, {
			nickname: user.nickname ?? undefined,
			active: user.active ?? true
		});
	}
}
