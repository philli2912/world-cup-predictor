import type { Team } from "@/lib/types";

/**
 * ⚠️ DEMO VALUES — NOT LIVE DATA
 *
 * Every number in this file is a hand-set placeholder chosen to be *plausible*
 * (roughly in line with publicly known Elo ratings, FIFA rankings, and World
 * Cup track records as of early 2026), but none of it is fetched from a
 * documented data source. The UI labels any output derived from these values
 * as "demo model values".
 *
 * To upgrade to real data, replace this file's values with a fetch from a
 * documented source (e.g. eloratings.net, FIFA ranking API) and remove the
 * demo labeling in one place: `TEAM_DATA_STATUS` below.
 */

export const TEAM_DATA_STATUS = "demo model values" as const;

export const teams: Team[] = [
  { id: "france",      name: "France",      code: "FRA", flag: "🇫🇷", elo: 2065, fifaRanking: 2,  worldCupHistory: 85 },
  { id: "brazil",      name: "Brazil",      code: "BRA", flag: "🇧🇷", elo: 2010, fifaRanking: 5,  worldCupHistory: 100 },
  { id: "argentina",   name: "Argentina",   code: "ARG", flag: "🇦🇷", elo: 2085, fifaRanking: 1,  worldCupHistory: 90 },
  { id: "england",     name: "England",     code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", elo: 2000, fifaRanking: 4,  worldCupHistory: 55 },
  { id: "spain",       name: "Spain",       code: "ESP", flag: "🇪🇸", elo: 2055, fifaRanking: 3,  worldCupHistory: 58 },
  { id: "germany",     name: "Germany",     code: "GER", flag: "🇩🇪", elo: 1945, fifaRanking: 10, worldCupHistory: 92 },
  { id: "portugal",    name: "Portugal",    code: "POR", flag: "🇵🇹", elo: 1975, fifaRanking: 6,  worldCupHistory: 42 },
  { id: "netherlands", name: "Netherlands", code: "NED", flag: "🇳🇱", elo: 1960, fifaRanking: 7,  worldCupHistory: 60 },
  { id: "belgium",     name: "Belgium",     code: "BEL", flag: "🇧🇪", elo: 1900, fifaRanking: 8,  worldCupHistory: 38 },
  { id: "croatia",     name: "Croatia",     code: "CRO", flag: "🇭🇷", elo: 1880, fifaRanking: 11, worldCupHistory: 48 },
  { id: "uruguay",     name: "Uruguay",     code: "URU", flag: "🇺🇾", elo: 1855, fifaRanking: 14, worldCupHistory: 62 },
  { id: "morocco",     name: "Morocco",     code: "MAR", flag: "🇲🇦", elo: 1845, fifaRanking: 12, worldCupHistory: 30 },
  { id: "usa",         name: "USA",         code: "USA", flag: "🇺🇸", aliases: ["United States"], elo: 1790, fifaRanking: 16, worldCupHistory: 25 },
  { id: "mexico",      name: "Mexico",      code: "MEX", flag: "🇲🇽", elo: 1785, fifaRanking: 17, worldCupHistory: 32 },
  { id: "japan",       name: "Japan",       code: "JPN", flag: "🇯🇵", elo: 1815, fifaRanking: 18, worldCupHistory: 24 },
  { id: "south-korea", name: "South Korea", code: "KOR", flag: "🇰🇷", aliases: ["Korea Republic"], elo: 1755, fifaRanking: 22, worldCupHistory: 27 },
];

export function getTeam(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

/** Match a team name from an external source (e.g. the fetched bracket). */
export function findTeamByName(name: string): Team | undefined {
  const needle = name.trim().toLowerCase();
  return teams.find(
    (t) =>
      t.name.toLowerCase() === needle ||
      t.code.toLowerCase() === needle ||
      t.aliases?.some((a) => a.toLowerCase() === needle),
  );
}
