import type {
  FactorKey,
  FactorScore,
  MatchupPrediction,
  Team,
  TeamStrength,
} from "@/lib/types";
import { activeTeams } from "./teams";
import { factorLabels, PROBABILITY_SCALE, weights } from "./weights";

/**
 * Pure prediction functions. No React, no I/O. Normalization spans the
 * active knockout field only (data/teamStrength.json) — scores are
 * relative to the teams still alive, not to world football at large.
 */

interface FactorRange {
  min: number;
  max: number;
}

function datasetRange(key: FactorKey): FactorRange {
  const values = activeTeams.map((t) => t[key]);
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Normalize a raw factor value to 0–100 within the dataset.
 * FIFA ranking is inverted (rank 1 is best).
 */
function normalize(key: FactorKey, raw: number): number {
  const { min, max } = datasetRange(key);
  if (max === min) return 50;
  const fraction = (raw - min) / (max - min);
  const oriented = key === "fifaRanking" ? 1 - fraction : fraction;
  return oriented * 100;
}

export function computeStrength(team: Team): TeamStrength {
  const factors: FactorScore[] = (
    Object.keys(weights) as FactorKey[]
  ).map((key) => {
    const raw = team[key];
    const normalized = normalize(key, raw);
    return {
      factor: key,
      label: factorLabels[key],
      raw,
      normalized,
      weighted: normalized * weights[key],
    };
  });

  return {
    team,
    score: factors.reduce((sum, f) => sum + f.weighted, 0),
    factors,
  };
}

/** Elo-style logistic: maps a strength gap to P(A wins). */
function winProbability(scoreA: number, scoreB: number): number {
  return 1 / (1 + Math.pow(10, (scoreB - scoreA) / PROBABILITY_SCALE));
}

function formatRaw(key: FactorKey, raw: number): string {
  if (key === "fifaRanking") return `#${raw}`;
  return String(Math.round(raw));
}

function buildExplanation(a: TeamStrength, b: TeamStrength): string[] {
  const [stronger, weaker] =
    a.score >= b.score ? [a, b] : [b, a];

  // Rank factors by how much they separate the two teams (weighted).
  const gaps = stronger.factors
    .map((f, i) => ({
      key: f.factor,
      label: f.label,
      diff: f.weighted - weaker.factors[i].weighted,
      strongerRaw: formatRaw(f.factor, f.raw),
      weakerRaw: formatRaw(f.factor, weaker.factors[i].raw),
    }))
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));

  const lines: string[] = [];
  for (const g of gaps) {
    if (Math.abs(g.diff) < 0.5) {
      lines.push(
        `${g.label} is effectively even (${g.strongerRaw} vs ${g.weakerRaw}).`,
      );
    } else if (g.diff > 0) {
      lines.push(
        `${g.label} favors ${stronger.team.name} (${g.strongerRaw} vs ${g.weakerRaw}).`,
      );
    } else {
      lines.push(
        `${g.label} favors ${weaker.team.name} (${g.weakerRaw} vs ${g.strongerRaw}), but not by enough to offset the other factors.`,
      );
    }
  }
  return lines;
}

export function predictMatchup(teamA: Team, teamB: Team): MatchupPrediction {
  const a = computeStrength(teamA);
  const b = computeStrength(teamB);
  const probabilityA = winProbability(a.score, b.score);

  return {
    a,
    b,
    probabilityA,
    probabilityB: 1 - probabilityA,
    favored: probabilityA >= 0.5 ? teamA : teamB,
    explanation: buildExplanation(a, b),
  };
}
