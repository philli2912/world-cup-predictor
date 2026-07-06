/**
 * Generates docs/prediction-log.md from the committed tournament snapshot
 * (data/knockoutContext.json). The log freezes what was known — and what
 * the demo model predicted — at snapshot time, so git history documents
 * provenance. It never re-fetches data.
 *
 * Run: npm run generate-log  (also runs automatically after update-data)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnockoutContext, KnockoutMatch } from "../lib/types";
import { findTeamByName } from "../lib/model/teams";
import { predictMatchup } from "../lib/model/predict";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "knockoutContext.json");
const OUT_PATH = path.join(process.cwd(), "docs", "prediction-log.md");

function slot(team: KnockoutMatch["teamA"], placeholder: string | null): string {
  return team?.name ?? placeholder ?? "Pending confirmation";
}

function scoreCell(m: KnockoutMatch): string {
  if (!m.score) return "—";
  const pens = m.penalties ? ` (${m.penalties.a}–${m.penalties.b} pens)` : "";
  return `${m.score.a}–${m.score.b}${pens}`;
}

async function main() {
  let context: KnockoutContext;
  try {
    context = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
  } catch (err) {
    console.error(
      `✗ Could not read ${SNAPSHOT_PATH}: ${(err as Error).message}\n` +
        "  Run `npm run update-data` first.",
    );
    process.exit(1);
  }

  const completed = context.completedMatches;
  const upcoming = context.upcomingMatches;

  // Demo predictions only for fixtures that were upcoming at snapshot time
  // and where BOTH teams exist in the demo model dataset.
  const predictions = upcoming
    .filter((m) => m.teamA && m.teamB)
    .flatMap((m) => {
      const a = findTeamByName(m.teamA!.name);
      const b = findTeamByName(m.teamB!.name);
      if (!a || !b) return [];
      const p = predictMatchup(a, b);
      return [
        {
          match: m,
          aName: a.name,
          bName: b.name,
          pctA: Math.round(p.probabilityA * 100),
          pctB: Math.round(p.probabilityB * 100),
          favored: p.favored.name,
        },
      ];
    });

  const noModelData = upcoming.filter(
    (m) =>
      m.teamA &&
      m.teamB &&
      (!findTeamByName(m.teamA.name) || !findTeamByName(m.teamB.name)),
  );

  const lines: string[] = [
    "# Prediction log",
    "",
    "A frozen record of what was known — and what the demo model estimated —",
    "at the time the tournament snapshot was fetched. Regenerated whenever the",
    "snapshot updates; git history preserves earlier versions.",
    "",
    `- **Log generated:** ${new Date().toISOString()}`,
    `- **Snapshot fetchedAt:** ${context.fetchedAt}`,
    `- **Source:** ${context.source.name}`,
    `- **Source URL:** ${context.source.url}`,
    `- **Snapshot dataStatus:** ${context.dataStatus}`,
    `- **Tournament:** ${context.tournamentLabel}`,
    "",
    "## Notes on interpretation",
    "",
    "- Completed matches below are **displayed as results, not predictions** —",
    "  the model takes no credit for matches already decided at snapshot time.",
    "- Demo predictions **only apply to fixtures that were upcoming at snapshot",
    "  time**. A prediction logged after a result is known would be worthless;",
    "  the `fetchedAt` timestamp and git commit history establish the ordering.",
    "- All model outputs are **demo/model values** computed from hand-set",
    "  placeholder inputs (see `lib/model/teams.ts`), unless documented",
    "  otherwise. The probability curve is uncalibrated. Nothing in this log",
    "  demonstrates predictive accuracy — only transparency about what was",
    "  claimed, and when.",
    "",
    `## Completed matches at snapshot time (${completed.length})`,
    "",
    "| Match | Round | Fixture | Result | Advanced |",
    "|---|---|---|---|---|",
    ...completed.map(
      (m) =>
        `| ${m.id} | ${m.round} | ${slot(m.teamA, m.placeholderA)} vs ${slot(m.teamB, m.placeholderB)} | ${scoreCell(m)} | ${m.winner ?? "—"} |`,
    ),
    "",
    `## Upcoming fixtures at snapshot time (${upcoming.length})`,
    "",
    "| Match | Round | Fixture | Kickoff (UTC) | Status |",
    "|---|---|---|---|---|",
    ...upcoming.map(
      (m) =>
        `| ${m.id} | ${m.round} | ${slot(m.teamA, m.placeholderA)} vs ${slot(m.teamB, m.placeholderB)} | ${m.kickoffUtc} | ${m.status} |`,
    ),
    "",
    `## Demo predictions for upcoming fixtures (${predictions.length})`,
    "",
    "Only fixtures where both teams exist in the 16-team demo dataset.",
    "**Demo model values — uncalibrated, not betting advice.**",
    "",
  ];

  if (predictions.length > 0) {
    lines.push(
      "| Match | Fixture | P(win) | Favored |",
      "|---|---|---|---|",
      ...predictions.map(
        (p) =>
          `| ${p.match.id} | ${p.aName} vs ${p.bName} | ${p.pctA}% / ${p.pctB}% | ${p.favored} |`,
      ),
    );
  } else {
    lines.push("_None — no upcoming fixture has both teams in the dataset._");
  }

  if (noModelData.length > 0) {
    lines.push(
      "",
      "No prediction is logged for these upcoming fixtures because at least",
      "one team is outside the demo dataset (the model never invents values):",
      "",
      ...noModelData.map(
        (m) => `- ${m.id}: ${m.teamA!.name} vs ${m.teamB!.name}`,
      ),
    );
  }

  lines.push("");

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, lines.join("\n"));
  console.log(
    `✓ Wrote ${OUT_PATH}\n` +
      `  snapshot fetchedAt: ${context.fetchedAt}\n` +
      `  completed: ${completed.length} · upcoming: ${upcoming.length} · demo predictions: ${predictions.length}`,
  );
}

main();
