import { getName as getNameFromUtils } from '$lib/utils';
import { getAllMatches, getAllMatchIds, getUserName, getActiveSteamids } from '$lib/server/mongodb';

const userNameCache = new Map<string, string>();

export const fetchMatches = async () => {
	const matches = await getAllMatches();

	if (!matches || !Array.isArray(matches)) {
		return [];
	}

	const uniqueSteamids = new Set<string>();
	for (const match of matches) {
		if (match?.playerStats) {
			for (const playerStat of match.playerStats) {
				uniqueSteamids.add(playerStat.steamid);
			}
		}
	}

	const namePromises = Array.from(uniqueSteamids).map(async (steamid) => {
		if (!userNameCache.has(steamid)) {
			const name = await getUserName(steamid);
			userNameCache.set(steamid, name);
		}
		return { steamid, name: userNameCache.get(steamid)! };
	});

	await Promise.all(namePromises);

	for (const match of matches) {
		if (match?.playerStats) {
			for (const playerStat of match.playerStats) {
				playerStat.name = userNameCache.get(playerStat.steamid)!;
			}
		}
	}
	return matches;
};

export const getPlayerName = async (steamid: string): Promise<string> => {
	if (userNameCache.has(steamid)) {
		return userNameCache.get(steamid)!;
	}
	const name = await getUserName(steamid);
	userNameCache.set(steamid, name);
	return name;
};

export const isExcludedPlayer = async (steamid: string): Promise<boolean> => {
	const activeSteamids = await getActiveSteamids();
	return !activeSteamids.includes(steamid);
};

export { getAllMatchIds };
