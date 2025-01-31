import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
// 
export const getMapString = (map: string) => {
	//remove de_ from the start, capitalise first character after de_ and if there is a number put a space before it
	return map.replace("de_", "").charAt(0).toUpperCase() + map.replace("de_", "").slice(1).replace(/[0-9]/g, " $&");
};

export const calculateHLTVRating = (killsPerRound,
	deathsPerRound,
	assistsPerRound,
	impact,
	adr, // Average Damage per Round
	survivalRate) => {
	const weights = {
		kpr: 0.35,       // Kills Per Round
		dpr: -0.15,      // Deaths Per Round (negative weight because lower is better)
		apr: 0.1,        // Assists Per Round
		impact: 0.2,     // Impact Rating
		adr: 0.2,        // Average Damage per Round
		survivalRate: 0.1, // Survival Rate
	};

	// Normalize inputs to a scale similar to HLTV's (around 1.00 as average)
	const normalized = {
		kpr: killsPerRound / 0.75,       // Average KPR is about 0.75
		dpr: 1 - deathsPerRound / 0.65, // Average DPR is about 0.65
		apr: assistsPerRound / 0.15,    // Average APR is about 0.15
		impact: impact / 1.0,           // Impact is already normalized around 1.0
		adr: adr / 80,                  // Average ADR is about 80
		survivalRate: survivalRate / 0.35, // Average survival rate is around 35%
	};

	// Calculate weighted rating
	const rating =
		weights.kpr * normalized.kpr +
		weights.dpr * normalized.dpr +
		weights.apr * normalized.apr +
		weights.impact * normalized.impact +
		weights.adr * normalized.adr +
		weights.survivalRate * normalized.survivalRate;

	return parseFloat(rating.toFixed(2));
};

export const calculateDeathsPerRound = (deaths, rounds) => {
	return (deaths / rounds).toFixed(2);
};

export const calculateKillsPerRound = (kills, rounds) => {
	return (kills / rounds).toFixed(2);
};

export const calculateAssistsPerRound = (assists, rounds) => {
	return (assists / rounds).toFixed(2);
};

export const calculateADR = (damage, rounds) => {
	return (kills / rounds).toFixed(2);
};

export const calculateImpact = (playerStats) => {
	// Extract multikill data from playerStats
	const { twoK, threeK, fourK, fiveK } = playerStats;

	// Define points for each type of multikill
	const impactScore = (twoK * 1) + (threeK * 2) + (fourK * 3) + (fiveK * 5);

	return impactScore;
}

export const calculateSurvivalRate = (roundsSurvived, rounds) => {
	return (roundsSurvived / rounds).toFixed(2);
}

export const getName = (player: { name: string; steamid: string; }) => {
	const players = {
		"76561198122107609": "Matthew",
		"76561198254284578": "Frenchy",
		"76561198042044970": "Lillie",
		"76561198091576900": "Potto",
		"76561198066770946": "Tom",
		"76561198046884782": "Connor",
		"76561198093204957": "Phil",
		"76561198070288030": "Evan",
		"76561198159005292": "Sam",
		"76561198061148990": "Callum",
		"76561198092288421": "Steve",
		"76561198273647139": "Brock",
		"76561198051802093": "Dan",
		"76561198040636119": "Bingham",
		"76561198061114587": "Liam",
		"76561198114107073": "Pona",
		"76561198070364957": "Dom"
	}

	if (players[player.steamid]) {
		return players[player.steamid];
	}

	return player.name;
}

export const getNameById = (id: string) => {
	const players = {
		"76561198122107609": "Matthew",
		"76561198254284578": "Frenchy",
		"76561198042044970": "Lillie",
		"76561198091576900": "Potto",
		"76561198066770946": "Tom",
		"76561198046884782": "Connor",
		"76561198093204957": "Phil",
		"76561198070288030": "Evan",
		"76561198159005292": "Sam",
		"76561198061148990": "Callum",
		"76561198092288421": "Steve",
		"76561198273647139": "Brock",
		"76561198051802093": "Dan",
		"76561198040636119": "Bingham",
		"76561198061114587": "Liam",
		"76561198114107073": "Pona",
		"76561198070364957": "Dom"
	}

	return players[id] || false;
}

