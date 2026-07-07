import type { Metadata } from "next";
import { loadKnockoutContext } from "@/lib/knockout";
import { findTeamByName } from "@/lib/model/teams";
import {
  MatchupPredictor,
  type QuickPick,
} from "@/components/predictor/MatchupPredictor";

export const metadata: Metadata = {
  title: "Matchup predictor",
  description:
    "Estimate win probabilities for the active World Cup knockout teams using source-backed FIFA rank and Elo inputs in a demo-calibrated model.",
};

export default async function PredictPage() {
  const context = await loadKnockoutContext();

  // Offer real upcoming fixtures as one-click picks — but only where both
  // teams exist in the active-team dataset. Others are never silently mapped.
  const quickPicks: QuickPick[] =
    context?.upcomingMatches
      .filter((m) => m.teamA && m.teamB)
      .flatMap((m) => {
        const a = findTeamByName(m.teamA!.name);
        const b = findTeamByName(m.teamB!.name);
        if (!a || !b) return [];
        return [
          {
            label: `${m.round}: ${a.name} vs ${b.name}`,
            round: m.round,
            teamAId: a.id,
            teamBId: b.id,
          },
        ];
      })
      .slice(0, 4) ?? [];

  const first = quickPicks[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Matchup predictor
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Pick any two of the 12 teams still active in the knockout bracket.
          FIFA rank and Elo rating are source-backed; the history score is a
          derived demo value. Eliminated teams stay visible in completed
          results but are not modelled forward — the model won&apos;t invent
          numbers for them.
        </p>
        {context && (
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Bracket quick-picks come from the static data snapshot fetched{" "}
            {new Date(context.fetchedAt).toISOString().slice(0, 16).replace("T", " ")}{" "}
            UTC ({context.source.name}) — the app does no live fetching.
          </p>
        )}
      </header>

      <MatchupPredictor
        quickPicks={quickPicks}
        initialA={first?.teamAId}
        initialB={first?.teamBId}
      />
    </div>
  );
}
