/**
 * Fetches current World Cup knockout fixtures/results and writes a
 * normalized snapshot to data/knockoutContext.json.
 *
 * Primary source:  FIFA website data endpoint (undocumented; may change).
 * Fallback source: ESPN public scoreboard JSON.
 *
 * Run: npm run update-data
 *
 * Guarantees:
 * - Never invents fixtures. Undecided slots keep their placeholder label.
 * - Never overwrites an existing good snapshot on failure — it exits
 *   non-zero with an explanation of what needs fixing instead.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  KnockoutContext,
  KnockoutMatch,
  KnockoutRound,
  MatchDataStatus,
  QuarterFinalPath,
} from "../lib/types";

const OUT_PATH = path.join(process.cwd(), "data", "knockoutContext.json");

const FIFA_URL =
  "https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=500&language=en";
const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260720";

const KNOCKOUT_ROUNDS: KnockoutRound[] = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Play-off for third place",
  "Final",
];

/** Sanity floor: the 2026 knockout stage has 32 matches in total. */
const MIN_EXPECTED_KNOCKOUT_MATCHES = 24;

// ---------------------------------------------------------------------------
// FIFA source
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any -- external, undocumented payloads */

function localized(field: any): string | null {
  if (Array.isArray(field) && field[0]?.Description) {
    return String(field[0].Description);
  }
  return null;
}

function fifaTeam(side: any): KnockoutMatch["teamA"] {
  if (!side || !side.IdTeam) return null;
  const name = localized(side.TeamName);
  if (!name) return null;
  return {
    sourceId: String(side.IdTeam),
    name,
    code: String(side.Abbreviation ?? "").toUpperCase() || "—",
  };
}

/**
 * "W89" → "Winner of M89"; "RU101" → "Loser of M101" (third-place playoff);
 * group-stage refs like "1E" → "Group slot 1E".
 */
function describePlaceholder(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  const winnerRef = raw.match(/^W(\d+)$/);
  if (winnerRef) return `Winner of M${winnerRef[1]}`;
  const loserRef = raw.match(/^RU(\d+)$/);
  if (loserRef) return `Loser of M${loserRef[1]}`;
  return `Group slot ${raw}`;
}

function fifaStatus(match: any): MatchDataStatus {
  // Observed values on this endpoint: 0 = played, 1 = scheduled.
  if (match.MatchStatus === 0) return "confirmed result";
  if (match.MatchStatus === 1) return "upcoming fixture";
  return "pending confirmation";
}

function parseFifa(payload: any): Omit<KnockoutContext, "fetchedAt"> {
  const results = payload?.Results;
  if (!Array.isArray(results)) {
    throw new Error(
      "FIFA payload shape changed: expected a top-level Results array. " +
        "Inspect the endpoint response and update parseFifa().",
    );
  }

  const knockout = results.filter((m: any) =>
    KNOCKOUT_ROUNDS.includes(localized(m.StageName) as KnockoutRound),
  );
  if (knockout.length < MIN_EXPECTED_KNOCKOUT_MATCHES) {
    throw new Error(
      `FIFA payload contained only ${knockout.length} knockout matches ` +
        `(expected at least ${MIN_EXPECTED_KNOCKOUT_MATCHES}). The stage ` +
        "names or season id may have changed — verify FIFA_URL.",
    );
  }

  const matches: KnockoutMatch[] = knockout.map((m: any) => {
    const teamA = fifaTeam(m.Home);
    const teamB = fifaTeam(m.Away);
    const status = fifaStatus(m);
    const hasScore =
      typeof m.HomeTeamScore === "number" && typeof m.AwayTeamScore === "number";
    const hasPens =
      typeof m.HomeTeamPenaltyScore === "number" &&
      typeof m.AwayTeamPenaltyScore === "number" &&
      (m.HomeTeamPenaltyScore > 0 || m.AwayTeamPenaltyScore > 0);

    let winner: string | null = null;
    if (status === "confirmed result" && m.Winner) {
      if (String(m.Winner) === teamA?.sourceId) winner = teamA.name;
      else if (String(m.Winner) === teamB?.sourceId) winner = teamB.name;
    }

    return {
      id: `M${m.MatchNumber}`,
      matchNumber: Number(m.MatchNumber),
      round: localized(m.StageName) as KnockoutRound,
      teamA,
      teamB,
      placeholderA: teamA ? null : describePlaceholder(m.PlaceHolderA),
      placeholderB: teamB ? null : describePlaceholder(m.PlaceHolderB),
      kickoffUtc: String(m.Date),
      status,
      score: hasScore ? { a: m.HomeTeamScore, b: m.AwayTeamScore } : null,
      penalties: hasPens
        ? { a: m.HomeTeamPenaltyScore, b: m.AwayTeamPenaltyScore }
        : null,
      winner,
      highlighted: false,
    };
  });

  return assembleContext(matches, {
    tournamentLabel:
      localized(results[0]?.SeasonName) ?? "FIFA World Cup 2026",
    source: {
      name: "FIFA website data endpoint (fixtures/results)",
      url: FIFA_URL,
    },
    dataStatus: "fetched",
    notes: [],
  });
}

// ---------------------------------------------------------------------------
// ESPN fallback source
// ---------------------------------------------------------------------------

function espnRound(event: any): KnockoutRound | null {
  const name = event?.season?.type?.name ?? event?.competitions?.[0]?.type?.text;
  const candidates: [string, KnockoutRound][] = [
    ["round of 32", "Round of 32"],
    ["round of 16", "Round of 16"],
    ["quarterfinal", "Quarter-final"],
    ["quarter-final", "Quarter-final"],
    ["semifinal", "Semi-final"],
    ["semi-final", "Semi-final"],
    ["third place", "Play-off for third place"],
    ["final", "Final"],
  ];
  const lower = String(name ?? "").toLowerCase();
  for (const [needle, round] of candidates) {
    if (lower.includes(needle)) return round;
  }
  return null;
}

function parseEspn(payload: any): Omit<KnockoutContext, "fetchedAt"> {
  const events = payload?.events;
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error(
      "ESPN payload shape changed or returned no events for the knockout " +
        "date range. Inspect the endpoint response and update parseEspn().",
    );
  }

  const matches: KnockoutMatch[] = [];
  for (const [index, event] of events.entries()) {
    const round = espnRound(event);
    if (!round) continue;
    const comp = event.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
    const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
    if (!home?.team || !away?.team) continue;

    const stateName = String(event.status?.type?.name ?? "");
    const status: MatchDataStatus =
      stateName === "STATUS_FINAL"
        ? "confirmed result"
        : stateName === "STATUS_SCHEDULED"
          ? "upcoming fixture"
          : "pending confirmation";

    const finished = status === "confirmed result";
    matches.push({
      id: `E${index + 1}`,
      matchNumber: index + 1,
      round,
      teamA: {
        sourceId: String(home.team.id),
        name: String(home.team.displayName),
        code: String(home.team.abbreviation ?? "—"),
      },
      teamB: {
        sourceId: String(away.team.id),
        name: String(away.team.displayName),
        code: String(away.team.abbreviation ?? "—"),
      },
      placeholderA: null,
      placeholderB: null,
      kickoffUtc: String(event.date),
      status,
      score: finished
        ? { a: Number(home.score), b: Number(away.score) }
        : null,
      penalties: null,
      winner: finished
        ? home.winner
          ? String(home.team.displayName)
          : away.winner
            ? String(away.team.displayName)
            : null
        : null,
      highlighted: false,
    });
  }

  if (matches.length === 0) {
    throw new Error(
      "ESPN returned events but none mapped to a knockout round. " +
        "Round naming may have changed — update espnRound().",
    );
  }

  return assembleContext(matches, {
    tournamentLabel: String(
      payload?.leagues?.[0]?.season?.displayName ?? "FIFA World Cup 2026",
    ),
    source: { name: "ESPN public scoreboard JSON (fallback)", url: ESPN_URL },
    dataStatus: "fetched (fallback source)",
    notes: [
      "Fallback source: bracket placeholders and quarter-final paths are " +
        "not available from ESPN; only listed fixtures/results are shown.",
    ],
  });
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Shared assembly
// ---------------------------------------------------------------------------

function assembleContext(
  matches: KnockoutMatch[],
  meta: Pick<
    KnockoutContext,
    "tournamentLabel" | "source" | "dataStatus" | "notes"
  >,
): Omit<KnockoutContext, "fetchedAt"> {
  matches.sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc));

  // Auto-highlight: the next upcoming fixtures where both teams are known.
  const upcoming = matches.filter((m) => m.status !== "confirmed result");
  upcoming
    .filter((m) => m.teamA && m.teamB)
    .slice(0, 4)
    .forEach((m) => (m.highlighted = true));

  // Quarter-final paths from "Winner of M##" placeholder chains (FIFA only).
  const byId = new Map(matches.map((m) => [m.id, m]));
  const slotLabel = (
    team: KnockoutMatch["teamA"],
    placeholder: string | null,
  ) => team?.name ?? placeholder ?? "TBD";

  const quarterFinalPaths: QuarterFinalPath[] = matches
    .filter((m) => m.round === "Quarter-final")
    .map((qf) => {
      const feederIds = [qf.placeholderA, qf.placeholderB]
        .map((p) => p?.match(/^Winner of (M\d+)$/)?.[1])
        .filter((id): id is string => Boolean(id) && byId.has(id!));
      // If a QF team is already decided, its feeder is the completed R16
      // match that produced it.
      for (const team of [qf.teamA, qf.teamB]) {
        if (!team) continue;
        const feeder = matches.find(
          (m) => m.round === "Round of 16" && m.winner === team.name,
        );
        if (feeder) feederIds.push(feeder.id);
      }
      return {
        quarterFinalId: qf.id,
        label: `${slotLabel(qf.teamA, qf.placeholderA)} vs ${slotLabel(qf.teamB, qf.placeholderB)}`,
        feederMatchIds: [...new Set(feederIds)].sort(),
      };
    });

  return {
    ...meta,
    completedMatches: matches.filter((m) => m.status === "confirmed result"),
    upcomingMatches: upcoming,
    quarterFinalPaths,
  };
}

// ---------------------------------------------------------------------------
// Fetch orchestration
// ---------------------------------------------------------------------------

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  }
  return res.json();
}

async function main() {
  const attempts: string[] = [];
  let context: Omit<KnockoutContext, "fetchedAt"> | null = null;

  try {
    context = parseFifa(await fetchJson(FIFA_URL));
  } catch (err) {
    attempts.push(`FIFA source failed: ${(err as Error).message}`);
    try {
      context = parseEspn(await fetchJson(ESPN_URL));
    } catch (fallbackErr) {
      attempts.push(`ESPN fallback failed: ${(fallbackErr as Error).message}`);
    }
  }

  if (!context) {
    const existing = await readFile(OUT_PATH, "utf8").then(
      () => true,
      () => false,
    );
    console.error("✗ Could not update knockout context:\n");
    for (const line of attempts) console.error(`  - ${line}`);
    console.error(
      existing
        ? "\nThe existing data/knockoutContext.json was left untouched."
        : "\nNo existing snapshot exists yet — the app will show " +
            "'data unavailable' until a fetch succeeds.",
    );
    process.exit(1);
  }

  const snapshot: KnockoutContext = {
    ...context,
    fetchedAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + "\n");

  if (attempts.length > 0) {
    console.warn(`⚠ ${attempts[0]}`);
  }
  console.log(
    `✓ Wrote ${OUT_PATH}\n` +
      `  source:    ${snapshot.source.name}\n` +
      `  completed: ${snapshot.completedMatches.length} matches\n` +
      `  upcoming:  ${snapshot.upcomingMatches.length} matches\n` +
      `  fetchedAt: ${snapshot.fetchedAt}`,
  );
}

main();
