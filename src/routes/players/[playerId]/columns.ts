
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import SortableHeader from "./SortableHeader.svelte";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

export type MapData = {
	name: string;
	matches: number;
	winRate: string;
	avgKills: number;
	avgDeaths: number;
	avgAdr: number;
	avgRating: number;
};

export const basicColumns: ColumnDef<MapData>[] = [
	{
		accessorKey: "name",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Name",
				column,
			}),
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
		accessorKey: "matches",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Matches",
				column,
			}),
	},
	{
		accessorKey: "winRate",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Win Rate",
				column,
			}),
	},
	{
		accessorKey: "avgKills",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Kills",
				column,
			}),
	},
	{
		accessorKey: "avgDeaths",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Deaths",
				column,
			}),
	},
	{
		accessorKey: "avgAdr",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "ADR",
				column,
			}),
	},
	{
		accessorKey: "avgRating",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Rating",
				column,
			}),
	}
];

export const duelColumns: ColumnDef<MapData>[] = [
	{
		accessorKey: "name",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Name",
				column,
			}),
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
		accessorKey: "duels",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Duels",
				column,
			}),
	},

	{
		accessorKey: "winRate",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Win Rate",
				column,
			}),
		cell: ({ row }) => {

			const winRateCellSnippet = createRawSnippet<[string]>((getWinRate) => {
				const winRate = getWinRate();
				return {
					render: () => `<div class="text-center">${winRate}</div>`,
				};
			});

			return renderSnippet(
				winRateCellSnippet,
				parseFloat(row.getValue('winRate')).toFixed(1) + " %"
			);
		}
	},
	{
		accessorKey: "wins",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Wins",
				column,
			}),
	}
]
