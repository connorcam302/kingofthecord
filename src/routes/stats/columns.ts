import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import SortableHeader from "./SortableHeader.svelte";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import { getMapString } from '$lib/utils';

export type BasicData = {
	name: string;
	matches: number;
	winRate: string;
	avgKills: number;
	avgDeaths: number;
	avgAdr: number;
	avgRating: number;
	form: number;
};

/*{
	"name": "Brock",
	"steamid": "76561198273647139",
	"rawHltv": {
		"kpr": "0.5",
		"dpr": "0.7",
		"apr": "0.2",
		"impact": "2.8",
		"adr": "58.3"
	},
	"matches": 32,
	"winRate": "50.0%",
	"kills": "11.6",
	"deaths": "16.1",
	"assists": "5.3",
	"flashes": "3.6",
	"utilityDamage" : "8.5",
	"headshotPercentage": "58.3%",
	"avg_hltvRating": "1.13",
	"form": "1.40"
}*/

export type AdvancedData = {
	name: string;
	headshotPercentage: number;
	flashes: number;
	utilityDamage: number;
	kpr: number;
	dpr: number;
	apr: number;
	impact: number;
	adr: number;
	bestMap: string;
	worstMap: string;
}

export const advancedColumns: ColumnDef<AdvancedData>[] = [
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
					render: () => `<div class="text-left font-bold w-32">${name}</div>`,
				};
			});

			return renderSnippet(
				nameCellSnippet,
				row.getValue('name')
			);
		}
	},
	{
		accessorKey: "headshotPercentage",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "HS %",
				column,
			}),
		cell: ({ row }) => {

			const headshotPercentageCellSnippet = createRawSnippet<[string]>((getHeadshotPercentage) => {
				const headshotPercentage = getHeadshotPercentage();
				return {
					render: () => `<div class="text-center">${headshotPercentage}</div>`,
				};
			});

			return renderSnippet(
				headshotPercentageCellSnippet,
				parseFloat(row.getValue('headshotPercentage')).toFixed(1) + " %"
			);
		}
	},
	{
		accessorKey: "flashes",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Flashes",
				column,
			}),
		cell: ({ row }) => {

			const flashesCellSnippet = createRawSnippet<[string]>((getFlashes) => {
				const flashes = getFlashes();
				return {
					render: () => `<div class="text-center">${flashes}</div>`,
				};
			});

			return renderSnippet(
				flashesCellSnippet,
				parseFloat(row.getValue('flashes')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "utilityDamage",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Utility Damage",
				column,
			}),
		cell: ({ row }) => {

			const utilityDamageCellSnippet = createRawSnippet<[string]>((getUtilityDamage) => {
				const utilityDamage = getUtilityDamage();
				return {
					render: () => `<div class="text-center">${utilityDamage}</div>`,
				};
			});

			return renderSnippet(
				utilityDamageCellSnippet,
				parseFloat(row.getValue('utilityDamage')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "kpr",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "KPR",
				column,
			}),
		cell: ({ row }) => {

			const kprCellSnippet = createRawSnippet<[string]>((getKpr) => {
				const kpr = getKpr();
				return {
					render: () => `<div class="text-center">${kpr}</div>`,
				};
			});

			return renderSnippet(
				kprCellSnippet,
				parseFloat(row.getValue('kpr')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "dpr",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "DPR",
				column,
			}),
		cell: ({ row }) => {

			const dprCellSnippet = createRawSnippet<[string]>((getDpr) => {
				const dpr = getDpr();
				return {
					render: () => `<div class="text-center">${dpr}</div>`,
				};
			});

			return renderSnippet(
				dprCellSnippet,
				parseFloat(row.getValue('dpr')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "apr",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "APR",
				column,
			}),
		cell: ({ row }) => {

			const aprCellSnippet = createRawSnippet<[string]>((getApr) => {
				const apr = getApr();
				return {
					render: () => `<div class="text-center">${apr}</div>`,
				};
			});

			return renderSnippet(
				aprCellSnippet,
				parseFloat(row.getValue('apr')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "impact",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Impact",
				column,
			}),
		cell: ({ row }) => {

			const impactCellSnippet = createRawSnippet<[string]>((getImpact) => {
				const impact = getImpact();
				return {
					render: () => `<div class="text-center">${impact}</div>`,
				};
			});

			return renderSnippet(
				impactCellSnippet,
				parseFloat(row.getValue('impact')).toFixed(1)
			);
		}
	},
	{
		accessorKey: "highestMap",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Best Map",
				column,
			}),
		cell: ({ row }) => {

			const highestMapCellSnippet = createRawSnippet<[string]>((getHighestMap) => {
				const highestMap = getHighestMap();
				return {
					render: () => `<div class="text-center">${highestMap}</div>`,
				};
			});

			return renderSnippet(
				highestMapCellSnippet,
				getMapString(row.getValue('highestMap'))
			);
		}
	},
	{
		accessorKey: "lowestMap",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Worst Map",
				column,
			}),
		cell: ({ row }) => {

			const lowestMapCellSnippet = createRawSnippet<[string]>((getLowestMap) => {
				const lowestMap = getLowestMap();
				return {
					render: () => `<div class="text-center">${lowestMap}</div>`,
				};
			});

			return renderSnippet(
				lowestMapCellSnippet,
				getMapString(row.getValue('lowestMap'))
			);
		}
	}
]

export const basicColumns: ColumnDef<BasicData>[] = [
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
					render: () => `<div class="text-left font-bold w-32">${name}</div>`,
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
		cell: ({ row }) => {

			const winPercentCellSnippet = createRawSnippet<[string]>((getWinPercent) => {
				const winPercent = getWinPercent();
				return {
					render: () => `<div class="">${winPercent}</div>`,
				};
			});

			return renderSnippet(
				winPercentCellSnippet,
				parseFloat(row.getValue("winRate")).toFixed(1) + " %"
			);
		},
	},
	{
		accessorKey: "kills",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Kills",
				column,
			}),
		cell: ({ row }) => {

			const avgKillsCellSnippet = createRawSnippet<[string]>((getAvgKills) => {
				const avgKills = getAvgKills();
				return {
					render: () => `<div class="">${avgKills}</div>`,
				};
			});

			return renderSnippet(
				avgKillsCellSnippet,
				parseFloat(row.getValue("kills")).toFixed(1)
			);
		},
	},
	{
		accessorKey: "deaths",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Deaths",
				column,
			}),
		cell: ({ row }) => {

			const avgDeathsCellSnippet = createRawSnippet<[string]>((getAvgDeaths) => {
				const avgDeaths = getAvgDeaths();
				return {
					render: () => `<div class="">${avgDeaths}</div>`,
				};
			});

			return renderSnippet(
				avgDeathsCellSnippet,
				parseFloat(row.getValue("deaths")).toFixed(1)
			);
		},
	},
	{
		accessorKey: "assists",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Assists",
				column,
			}),
		cell: ({ row }) => {

			const avgAssistsCellSnippet = createRawSnippet<[string]>((getAvgAssists) => {
				const avgAssists = getAvgAssists();
				return {
					render: () => `<div class="">${avgAssists}</div>`,
				};
			});

			return renderSnippet(
				avgAssistsCellSnippet,
				parseFloat(row.getValue("assists")).toFixed(1)
			);
		},
	},
	{
		accessorKey: "adr",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "ADR",
				column,
			}),
		cell: ({ row }) => {

			const avgAdrCellSnippet = createRawSnippet<[string]>((getAvgAdr) => {
				const avgAdr = getAvgAdr();
				return {
					render: () => `<div class="">${avgAdr}</div>`,
				};
			});

			return renderSnippet(
				avgAdrCellSnippet,
				parseFloat(row.getValue("adr")).toFixed(1)
			);
		},
	},
	{
		accessorKey: "avg_hltvRating",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Rating",
				column,
			}),
		cell: ({ row }) => {

			const avgRatingCellSnippet = createRawSnippet<[string]>((getAvgRating) => {
				const avgRating = getAvgRating();
				return {
					render: () => `<div class="">${avgRating}</div>`,
				};
			});

			return renderSnippet(
				avgRatingCellSnippet,
				parseFloat(row.getValue("avg_hltvRating")).toFixed(2)
			);
		},
	},
	{
		accessorKey: "form",
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				label: "Form",
				column,
			}),
		cell: ({ row }) => {

			const formCellSnippet = createRawSnippet<[string]>((getForm) => {
				const form = getForm();
				return {
					render: () => `<div class="">${form}</div>`,
				};
			});

			return renderSnippet(
				formCellSnippet,
				parseFloat(row.getValue("form")).toFixed(2)
			);
		},
	},
];


