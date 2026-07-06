import type { FactorKey, ModelWeights } from "@/lib/types";

/**
 * Blend weights for the team strength score. Must sum to 1.
 * Chosen for interpretability, not fitted to historical outcomes.
 */
export const weights: ModelWeights = {
  elo: 0.5,
  fifaRanking: 0.3,
  worldCupHistory: 0.2,
};

export const factorLabels: Record<FactorKey, string> = {
  elo: "Elo rating",
  fifaRanking: "FIFA ranking",
  worldCupHistory: "World Cup history",
};

/**
 * Controls how a strength gap maps to win probability (Elo-style
 * logistic). A gap of this many strength points corresponds to 10:1
 * odds. Chosen so the largest possible gap in this dataset (~96
 * points) caps out near 92% — knockout matches are never near-certain,
 * and min–max normalization pins the weakest team close to 0.
 */
export const PROBABILITY_SCALE = 90;
