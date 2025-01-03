export interface Welcome {
	lobbyInfo: LobbyInfo;
	playerStats: PlayerStat[];
	rounds: Round[];
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
}

export interface PlayerStat {
	name: Name;
	steamid: string;
	team_number: number;
	oneK: number;
	twoK: number;
	threeK: number;
	fourK: number;
	fiveK: number;
	alive_time_total: number;
	assists_total: number;
	deaths_total: number;
	headshot_kills_total: number;
	kills_total: number;
	mvps: number;
	score: number;
	tick: number;
}

export interface Round {
	round: number;
	start: number;
	end: number | null;
	teamOneScore: number;
	teamTwoScore: number;
	damage: Damage[];
	winner?: Winner;
}

export interface Damage {
	attacker_name: string;
	attacker_steamid: string;
	team: number;
	damage_dealt: DamageDealt[];
}

export interface DamageDealt {
	damage: number;
	defender: string;
	defenderName: string;
	killed: boolean;
	events: Event[];
	killWeapon?: Weapon;
}

export interface Event {
	dmg_health: number;
	event_name: EventName;
	hitgroup: string;
	tick: number;
	weapon: string
}

export enum EventName {
	PlayerDeath = "player_death",
	PlayerHurt = "player_hurt",
}
