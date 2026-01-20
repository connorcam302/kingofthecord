import { getName as getNameFromUtils } from '$lib/utils';
import { getAllMatches, getAllMatchIds, getUserName, getActiveSteamids } from '$lib/server/mongodb';

const userNameCache = new Map<string, string>();

export const fetchMatches = async () => {
	const matches = await getAllMatches();

	if (!matches || !Array.isArray(matches)) {
		return [];
	}

	for (const match of matches) {
		if (match?.playerStats) {
			for (const playerStat of match.playerStats) {
				if (!userNameCache.has(playerStat.steamid)) {
					const name = await getUserName(playerStat.steamid);
					userNameCache.set(playerStat.steamid, name);
				}
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
