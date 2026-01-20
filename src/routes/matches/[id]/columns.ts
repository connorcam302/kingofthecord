import { renderComponent } from '$lib/components/ui/data-table';
import SortableHeader from './SortableHeader.svelte';
import type { ColumnDef } from '@tanstack/table-core';
import PlayerNameLink from './PlayerNameLink.svelte';

export type BasicTeamData = {
	name: string;
	steamid: string;
	assists_total: number;
	deaths_total: number;
	kills_total: number;
	damage_total: number;
	mvps: number;
	score: number;
};

export type AdvancedTeamData = {
	name: string;
	steamid: string;
	oneK: number;
	twoK: number;
	threeK: number;
	fourK: number;
	fiveK: number;
	alive_time_total: number;
	headshot_kills_total: number;
	enemies_flashed_total: number;
	utility_damage_total: number;
};

export type RatingTeamData = {
	name: string;
	killsPerRound: number;
	deathsPerRound: number;
	assistsPerRound: number;
	impact: number;
	adr: number;
	survivalRate: number;
};

export const basicColumns: ColumnDef<BasicTeamData>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Name',
				classProps: 'w-32',
				column
			}),
		cell: ({ row }) =>
			renderComponent(PlayerNameLink, {
				name: row.getValue('name'),
				steamid: row.original.steamid
			})
	},
	{
		accessorKey: 'kills_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Kills',
				column
			})
	},
	{
		accessorKey: 'deaths_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Deaths',
				column
			})
	},
	{
		accessorKey: 'assists_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Assists',
				column
			})
	},
	{
		accessorKey: 'mvps',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'MVPs',
				column
			})
	},
	{
		accessorKey: 'score',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Score',
				column
			})
	},
	{
		accessorKey: 'damage_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Damage',
				column
			})
	},
	{
		accessorKey: 'hltvRating',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Rating',
				column
			})
	}
];
export const advancedColumns: ColumnDef<AdvancedTeamData>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) =>
			renderComponent(PlayerNameLink, {
				name: row.getValue('name'),
				steamid: row.original.steamid
			})
	},
	{
		accessorKey: 'alive_time_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Time Alive',
				column
			})
	},
	{
		accessorKey: 'headshot_kills_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Headshots Kills',
				column
			})
	},
	{
		accessorKey: 'utility_damage_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Utility Damage',
				column
			})
	},
	{
		accessorKey: 'enemies_flashed_total',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Enemies Flashed',
				column
			})
	},
	{
		accessorKey: 'oneK',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: '1K',
				column
			})
	},
	{
		accessorKey: 'twoK',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: '2K',
				column
			})
	},
	{
		accessorKey: 'threeK',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: '3K',
				column
			})
	},
	{
		accessorKey: 'fourK',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: '4K',
				column
			})
	},
	{
		accessorKey: 'fiveK',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: '5K',
				column
			})
	},
	{
		accessorKey: 'score',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Score',
				column
			})
	}
];

export const ratingColumns: ColumnDef<RatingTeamData>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) =>
			renderComponent(PlayerNameLink, {
				name: row.getValue('name'),
				steamid: row.original.steamid
			})
	},
	{
		accessorKey: 'kpr',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'KPR',
				column
			})
	},
	{
		accessorKey: 'dpr',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'DPR',
				column
			})
	},
	{
		accessorKey: 'apr',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'APR',
				column
			})
	},
	{
		accessorKey: 'adr',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'ADR',
				column
			})
	},
	{
		accessorKey: 'impact',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Impact',
				column
			})
	},
	{
		accessorKey: 'survivalRate',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Survival Rate',
				column
			})
	},
	{
		accessorKey: 'hltvRating',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: 'Rating',
				column
			})
	}
];
