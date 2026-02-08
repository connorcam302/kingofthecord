import pino from 'pino';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PUBLIC_LOG_LEVEL } from '$env/static/public';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
//
export const getMapString = (map: string) => {
	return (
		map.replace('de_', '').charAt(0).toUpperCase() +
		map.replace('de_', '').slice(1).replace(/[0-9]/g, ' $&')
	);
};

export const ratingWeights = {
	kpr: 0.3,
	dpr: 0.1,
	apr: 0.1,
	impact: 0.2,
	adr: 0.25,
	survivalRate: 0.05
};

export const ratingNormalization = {
	kpr: 0.65,
	dpr: 0.65,
	apr: 0.25,
	impactMultiplier: 20,
	adr: 80,
	survivalRate: 0.35
};

export const calculateHLTVRating = (
	killsPerRound: number,
	deathsPerRound: number,
	assistsPerRound: number,
	impactPerRound: number,
	adr: number,
	survivalRate: number
) => {
	const normalized = {
		kpr: killsPerRound / ratingNormalization.kpr,
		dpr: ratingNormalization.dpr / deathsPerRound,
		apr: assistsPerRound / ratingNormalization.apr,
		ipr: impactPerRound * ratingNormalization.impactMultiplier,
		adr: adr / ratingNormalization.adr,
		survivalRate: survivalRate / ratingNormalization.survivalRate
	};

	const rating =
		(ratingWeights.kpr * normalized.kpr +
			ratingWeights.dpr * normalized.dpr +
			ratingWeights.apr * normalized.apr +
			ratingWeights.impact * normalized.ipr +
			ratingWeights.adr * normalized.adr +
			ratingWeights.survivalRate * normalized.survivalRate) *
		1.15;

	return parseFloat(rating.toFixed(2));
};

export const calculateDeathsPerRound = (deaths: number, rounds: number) => {
	return (deaths / rounds).toFixed(2);
};

export const calculateKillsPerRound = (kills: number, rounds: number) => {
	return (kills / rounds).toFixed(2);
};

export const calculateAssistsPerRound = (assists: number, rounds: number) => {
	return (assists / rounds).toFixed(2);
};

export const calculateADR = (damage: number, rounds: number) => {
	return (damage / rounds).toFixed(2);
};

export const calculateImpactPerRound = (impact: number, rounds: number) => {
	return (impact / rounds).toFixed(2);
};

export const calculateImpact = (playerStats: {
	twoK: number;
	threeK: number;
	fourK: number;
	fiveK: number;
}) => {
	// Extract multikill data from playerStats
	const { twoK, threeK, fourK, fiveK } = playerStats;

	// Define points for each type of multikill
	const impactScore = twoK * 1 + threeK * 2 + fourK * 3 + fiveK * 5;

	return impactScore;
};

export const calculateSurvivalRate = (roundsSurvived: number, rounds: number) => {
	return (roundsSurvived / rounds).toFixed(2);
};

export type PlayerRatingData = {
	kpr: number;
	dpr: number;
	apr: number;
	adr: number;
	impact: number;
	survivalRate: number;
	hltvRating: number;
	rawHLTVRating: {
		kpr: string;
		dpr: string;
		apr: string;
		adr: string;
		impact: number;
		survivalRate: string;
	};
};

export type PlayerMatchStats = {
	kills_total: number;
	deaths_total: number;
	assists_total: number;
	damage_total: number;
	twoK?: number;
	threeK?: number;
	fourK?: number;
	fiveK?: number;
	roundsSurvived?: number;
};

export type GameWithRating = {
	hltvRating: number;
	[key: string]: any;
};

export const calculateWeightedAvgRating = (games: GameWithRating[]): number => {
	if (games.length === 0) return 0;

	const recentGames = games.slice(0, 20);
	const maxWeight = Math.log(11);

	let weightedSum = 0;
	let totalWeight = 0;

	recentGames.forEach((game, index) => {
		let weight: number;
		if (index < 10) {
			weight = 1;
		} else {
			weight = Math.log(21 - index) / maxWeight;
		}
		weightedSum += game.hltvRating * weight;
		totalWeight += weight;
	});

	return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

export const calculatePlayerRating = (
	playerStats: PlayerMatchStats,
	rounds: number
): PlayerRatingData => {
	const kpr = playerStats.kills_total / rounds;
	const dpr = playerStats.deaths_total / rounds;
	const apr = playerStats.assists_total / rounds;
	const adr = playerStats.damage_total / rounds;
	const survivalRate = (rounds - playerStats.deaths_total) / rounds;
	const impact = calculateImpact(playerStats) / rounds;
	const hltvRating = calculateHLTVRating(kpr, dpr, apr, impact, adr, survivalRate);

	return {
		kpr,
		dpr,
		apr,
		adr,
		impact,
		survivalRate,
		hltvRating,
		rawHLTVRating: {
			kpr: kpr.toFixed(2),
			dpr: dpr.toFixed(2),
			apr: apr.toFixed(2),
			adr: adr.toFixed(2),
			impact,
			survivalRate: survivalRate.toFixed(2)
		}
	};
};

export const getName = (player: { name: string; steamid: string }) => {
	const players = {
		'76561198122107609': 'Matthew',
		'76561198254284578': 'Frenchy',
		'76561198042044970': 'Lillie',
		'76561198091576900': 'Potto',
		'76561198066770946': 'Tom',
		'76561198046884782': 'Connor',
		'76561198093204957': 'Phil',
		'76561198070288030': 'Evan',
		'76561198159005292': 'Sam',
		'76561198061148990': 'Callum',
		'76561198092288421': 'Steve',
		'76561198273647139': 'Brock',
		'76561198051802093': 'Dan',
		'76561198040636119': 'Bingham',
		'76561198061114587': 'Liam',
		'76561198114107073': 'Pona',
		'76561198070364957': 'Dom'
	};

	if (players[player.steamid]) {
		return players[player.steamid];
	}

	return player.name;
};

export const getNameById = (id: string) => {
	const players = {
		'76561198122107609': 'Matthew',
		'76561198254284578': 'Frenchy',
		'76561198042044970': 'Lillie',
		'76561198091576900': 'Potto',
		'76561198066770946': 'Tom',
		'76561198046884782': 'Connor',
		'76561198093204957': 'Phil',
		'76561198070288030': 'Evan',
		'76561198159005292': 'Sam',
		'76561198061148990': 'Callum',
		'76561198092288421': 'Steve',
		'76561198273647139': 'Brock',
		'76561198051802093': 'Dan',
		'76561198040636119': 'Bingham',
		'76561198061114587': 'Liam',
		'76561198114107073': 'Pona',
		'76561198070364957': 'Dom'
	};

	return players[id] || false;
};

const logger = pino({
	level: PUBLIC_LOG_LEVEL || 'info',
	transport: {
		target: 'pino/file',
		options: { destination: 1 }
	}
});

export const log = (message: string) => {
	logger.info({ module: 'utils' }, message);
};

export const logError = (message: string, error: unknown) => {
	logger.error({ module: 'utils', error: String(error) }, message);
};
