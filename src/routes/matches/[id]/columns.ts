import type { ColumnDef } from "@tanstack/table-core";
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
    "deaths_total": 15,
    "headshot_kills_total": 12,
    "kills_total": 23,
    "mvps": 2,
    "score": 59,
    "tick": 138258
}*/

export type BasicTeamData = {
	name: string;
	steamid: string;
	assists_total: number;
	deaths_total: number;
	kills_total: number;
	mvps: number;
};

export const basicColumns: ColumnDef<BasicTeamData>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "oneK",
		header: "1K",
	},
	{
		accessorKey: "twoK",
		header: "2K",
	},
	{
		accessorKey: "threeK",
		header: "3K",
	},
	{
		accessorKey: "fourK",
		header: "4K",
	},
];
