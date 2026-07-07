/** Shared types for the team strength model and tournament context. */

// ---------- Team strength model ----------

/**
 * Provenance status of a single model input:
 * - "source_backed": taken from a documented external source, with URL
 *   and as-of date recorded in data/teamStrength.json.
 * - "derived_demo": hand-derived demo value with no documented source.
 */
export type FactorStatus = "source_backed" | "derived_demo";

export interface FactorProvenance {
  status: FactorStatus;
  /** null for derived demo values */
  sourceUrl: string | null;
  /** ISO date the value is valid as of; null for derived demo values */
  asOf: string | null;
}

export interface Team {
  /** Stable slug used across the app, e.g. "france" */
  id: string;
  name: string;
  /** Three-letter code, e.g. "FRA" */
  code: string;
  flag: string;
  /** Alternate names used by external data sources, e.g. "USA" */
  aliases?: string[];
  /** Still alive in the knockout bracket — only active teams are modelled */
  isActive: boolean;
  /** Elo rating (source-backed — see provenance) */
  elo: number;
  /** FIFA world ranking position, lower is better (source-backed) */
  fifaRanking: number;
  /** World Cup pedigree score, 0–100 (derived demo value) */
  worldCupHistory: number;
  provenance: {
    elo: FactorProvenance;
    fifaRanking: FactorProvenance;
    worldCupHistory: FactorProvenance;
  };
  notes?: string;
}

export interface ModelWeights {
  elo: number;
  fifaRanking: number;
  worldCupHistory: number;
}

export type FactorKey = keyof ModelWeights;

export interface FactorScore {
  factor: FactorKey;
  label: string;
  /** Raw input value as stored in the dataset */
  raw: number;
  /** Normalized 0–100 within the dataset */
  normalized: number;
  /** Weighted contribution to the overall strength score */
  weighted: number;
}

export interface TeamStrength {
  team: Team;
  /** Blended 0–100 strength score */
  score: number;
  factors: FactorScore[];
}

export interface MatchupPrediction {
  a: TeamStrength;
  b: TeamStrength;
  /** P(team A wins), 0–1 */
  probabilityA: number;
  probabilityB: number;
  favored: Team;
  /** Human-readable reasons, ordered by influence */
  explanation: string[];
}

// ---------- Tournament (knockout) context ----------
// Produced by scripts/update-knockout-context.ts — never authored by hand
// and never inferred from model memory.

export type MatchDataStatus =
  | "confirmed result"
  | "upcoming fixture"
  | "pending confirmation";

export type KnockoutRound =
  | "Round of 32"
  | "Round of 16"
  | "Quarter-final"
  | "Semi-final"
  | "Play-off for third place"
  | "Final";

export interface KnockoutTeamRef {
  /** Source-provided team id */
  sourceId: string;
  name: string;
  code: string;
}

export interface KnockoutMatch {
  /** e.g. "M89" (official match number) */
  id: string;
  matchNumber: number;
  round: KnockoutRound;
  /** null when the slot is not yet decided */
  teamA: KnockoutTeamRef | null;
  teamB: KnockoutTeamRef | null;
  /** Shown when a team slot is undecided, e.g. "Winner of M93" */
  placeholderA: string | null;
  placeholderB: string | null;
  kickoffUtc: string;
  status: MatchDataStatus;
  score: { a: number; b: number } | null;
  penalties: { a: number; b: number } | null;
  /** Name of the advancing team (resolves penalty shootouts) */
  winner: string | null;
  highlighted: boolean;
}

export interface QuarterFinalPath {
  quarterFinalId: string;
  /** e.g. "France / Morocco" or "Winner M93 / Winner M94" */
  label: string;
  /** Round-of-16 match ids feeding this quarter-final */
  feederMatchIds: string[];
}

export interface KnockoutContext {
  tournamentLabel: string;
  source: {
    name: string;
    url: string;
  };
  fetchedAt: string;
  /** Status of the file as a whole */
  dataStatus: "fetched" | "fetched (fallback source)" | "unavailable";
  notes: string[];
  completedMatches: KnockoutMatch[];
  upcomingMatches: KnockoutMatch[];
  quarterFinalPaths: QuarterFinalPath[];
}
