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
    "Estimate win probabilities for a World Cup knockout matchup using an interpretable demo strength model.",
};

export default async function PredictPage() {
  const context = await loadKnockoutContext();

  // Offer real upcoming fixtures as one-click picks — but only where both
  // teams exist in the demo model dataset. Others are never silently mapped.
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
          Pick any two of the 16 teams in the demo dataset. Teams from the live
          bracket without model data (e.g. Norway, Colombia) are shown in the
          knockout context but can&apos;t be predicted — the model won&apos;t
          invent numbers for them.
        </p>
      </header>

      <MatchupPredictor
        quickPicks={quickPicks}
        initialA={first?.teamAId}
        initialB={first?.teamBId}
      />
    </div>
  );
}
