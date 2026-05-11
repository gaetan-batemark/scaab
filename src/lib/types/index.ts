// Global types — will be extended as features are built

export type UserRole = "admin" | "sporting_director" | "scout" | "coach";

export type PlayerPosition =
  | "GK" | "CB" | "LB" | "RB"
  | "DM" | "CM" | "AM"
  | "LW" | "RW" | "ST";

export type PlayerSource =
  | "api-football"
  | "football-data"
  | "anysport"
  | "sportdb"
  | "manual"
  | "csv-import";

export type ShortlistPlayerStatus =
  | "to_observe"
  | "monitoring"
  | "contacted"
  | "negotiating"
  | "signed"
  | "rejected";

export type PreferredFoot = "left" | "right" | "both";

export type ScoutingRecommendation = "recommend" | "monitor" | "reject";

export type ApiSource =
  | "api-football"
  | "football-data"
  | "anysport"
  | "sportdb"
  | "thesportsdb";
