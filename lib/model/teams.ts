import type { Team } from "@/lib/types";
import teamStrength from "@/data/teamStrength.json";

/**
 * Team strength inputs for the ACTIVE knockout field only.
 *
 * Values live in data/teamStrength.json and cover the 12 teams still alive
 * in the bracket. Per input, provenance differs:
 *
 * - FIFA rank — source-backed: official FIFA Men's World Ranking, with
 *   source URL and as-of date recorded per team.
 * - Elo rating — source-backed: World Football Elo Ratings
 *   (eloratings.net), independent of FIFA, with source URL and as-of date.
 * - World Cup history — derived demo value: a hand-derived 0–100 pedigree
 *   score with no documented source. Labeled "derived_demo" everywhere.
 *
 * Eliminated teams are deliberately NOT here. They still appear in
 * completed bracket results (data/knockoutContext.json) but are never
 * modelled forward — the predictor refuses to invent numbers for them.
 */

export const TEAM_DATA_STATUS =
  "source-backed FIFA rank & Elo · demo history score" as const;

/** Presentation-only extras keyed by team code (not model inputs). */
const display: Record<string, { flag: string; aliases?: string[] }> = {
  FRA: { flag: "🇫🇷" },
  MAR: { flag: "🇲🇦" },
  NOR: { flag: "🇳🇴" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  POR: { flag: "🇵🇹" },
  ESP: { flag: "🇪🇸" },
  USA: { flag: "🇺🇸", aliases: ["USA", "United States"] },
  BEL: { flag: "🇧🇪" },
  ARG: { flag: "🇦🇷" },
  EGY: { flag: "🇪🇬" },
  SUI: { flag: "🇨🇭" },
  COL: { flag: "🇨🇴" },
};

export const teams: Team[] = teamStrength.teams.map((t) => ({
  id: t.name.toLowerCase().replace(/\s+/g, "-"),
  name: t.name,
  code: t.code,
  flag: display[t.code]?.flag ?? "🏳️",
  aliases: display[t.code]?.aliases,
  isActive: t.isActive,
  elo: t.eloRating,
  fifaRanking: t.fifaRank,
  worldCupHistory: t.worldCupHistoryScore,
  provenance: {
    elo: { status: "source_backed", sourceUrl: t.eloSourceUrl, asOf: t.eloAsOf },
    fifaRanking: {
      status: "source_backed",
      sourceUrl: t.fifaRankSourceUrl,
      asOf: t.fifaRankAsOf,
    },
    worldCupHistory: { status: "derived_demo", sourceUrl: null, asOf: null },
  },
  notes: t.notes,
}));

/** The teams the predictor may select from — active knockout teams only. */
export const activeTeams: Team[] = teams.filter((t) => t.isActive);

/** Source metadata for the strength inputs, shown on the methodology page. */
export const strengthSources = teamStrength.sources;
export const strengthRetrievedAt = teamStrength.retrievedAt;

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

/**
 * Match a team name from an external source (e.g. the fetched bracket).
 * Only active teams resolve — eliminated teams in historical results are
 * displayed from the bracket snapshot and need no model data.
 */
export function findTeamByName(name: string): Team | undefined {
  const needle = name.trim().toLowerCase();
  return teams.find(
    (t) =>
      t.name.toLowerCase() === needle ||
      t.code.toLowerCase() === needle ||
      t.aliases?.some((a) => a.toLowerCase() === needle),
  );
}
