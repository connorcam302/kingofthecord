import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import SortableHeader from "./SortableHeader.svelte";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
/*{
    "name": "2colfox",
    "steamid": "76561198046884782",
    "team_number": 2,
    "oneK": 15,
    "twoK": 7,
    "threeK": 1,
    "fourK": 0,
    "fiveK": 0,
    "alive_time_total": 596,
    "assists_total": 9,
    "damage_total": 2571,
    "deaths_total": 15,
    "enemies_flashed_total": 5,
    "headshot_kills_total": 12,
    "kills_total": 23,
    "mvps": 2,
    "score": 59,
    "tick": 138258,
    "utility_damage_total": 218
}*/

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
}

export const basicColumns: ColumnDef<BasicTeamData>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {

			const nameCellSnippet = createRawSnippet<[string]>((getName) => {
				const name = getName();
				return {
					render: () => `<div class="text-left font-bold min-w-32">${name}</div>`,
				};
			});

			return renderSnippet(
				nameCellSnippet,
				row.getValue('name')
			);
		}
	},
	{
		accessorKey: "kills_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Kills",
				column,
			}),
	},
	{
		accessorKey: "deaths_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Deaths",
				column,
			}),
	},
	{
		accessorKey: "assists_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Assists",
				column,
			}),
	},
	{
		accessorKey: "mvps",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "MVPs",
				column,
			}),
	},
	{
		accessorKey: "score",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Score",
				column,
			}),
	},
	{
		accessorKey: "damage_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Damage",
				column,
			}),
	},
];
export const advancedColumns: ColumnDef<AdvancedTeamData>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {

			const nameCellSnippet = createRawSnippet<[string]>((getName) => {
				const name = getName();
				return {
					render: () => `<div class="text-left font-bold">${name}</div>`,
				};
			});

			return renderSnippet(
				nameCellSnippet,
				row.getValue('name')
			);
		}

	},
	{
		accessorKey: "alive_time_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Time Alive",
				column,
			}),
	},
	{
		accessorKey: "headshot_kills_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Headshots Kills",
				column,
			}),
	},
	{
		accessorKey: "utility_damage_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Utility Damage",
				column,
			}),
	},
	{
		accessorKey: "enemies_flashed_total",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Enemies Flashed",
				column,
			}),
	},
	{
		accessorKey: "oneK",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "1K",
				column,
			}),
	},
	{
		accessorKey: "twoK",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "2K",
				column,
			}),
	},
	{
		accessorKey: "threeK",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "3K",
				column,
			}),
	},
	{
		accessorKey: "fourK",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "4K",
				column,
			}),
	},
	{
		accessorKey: "fiveK",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "5K",
				column,
			}),

	},
	{
		accessorKey: "score",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Score",
				column,
			}),
	}
]
