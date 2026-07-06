import { readFile } from "node:fs/promises";
import path from "node:path";
import type { KnockoutContext } from "./types";

/**
 * Loads the committed tournament snapshot produced by
 * scripts/update-knockout-context.ts. Returns null if the file is
 * missing or malformed — callers render "data unavailable" in that
 * case rather than inventing fixtures.
 *
 * Read at build time (all pages are static); refreshing data means
 * re-running `npm run update-data` and redeploying.
 */
export async function loadKnockoutContext(): Promise<KnockoutContext | null> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "knockoutContext.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as KnockoutContext;
    if (
      !parsed.source?.url ||
      !parsed.fetchedAt ||
      !Array.isArray(parsed.completedMatches) ||
      !Array.isArray(parsed.upcomingMatches)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
