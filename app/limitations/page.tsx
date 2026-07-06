import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Limitations",
  description:
    "What this demo predictor honestly cannot tell you: placeholder inputs, no calibration, no match context, and an undocumented fixtures source.",
};

const limitations = [
  {
    title: "The model inputs are placeholders",
    body: "Elo ratings, FIFA rankings, and history scores are hand-set demo values — realistic-looking, but not fetched from any documented source and not updated as form changes. A win probability computed from stale or invented inputs is an illustration of a method, not a forecast you should rely on.",
  },
  {
    title: "The probability curve is uncalibrated",
    body: "The mapping from strength gap to win probability was chosen by eye, not fitted to historical knockout results. A displayed 70% has not been validated to mean 'wins 70% of the time'. Professional forecasters backtest against decades of matches; this project does not.",
  },
  {
    title: "No match context",
    body: "Injuries, suspensions, form, tactics, weather, travel, and the single-elimination chaos of knockout football are all invisible to a three-factor score. One-off matches are close to coin flips far more often than strength models suggest.",
  },
  {
    title: "The fixtures source is undocumented",
    body: "Bracket data comes from a FIFA website data endpoint that is not a stable public API — it can change shape or disappear. The update script validates what it fetches and fails loudly rather than guessing, but a stale snapshot is always possible; check the 'last updated' label.",
  },
  {
    title: "Sixteen teams only",
    body: "The demo dataset covers 16 major teams. Real bracket teams outside it (Norway, Colombia, Egypt, Switzerland, Paraguay…) get no prediction — deliberately. The model never invents values for teams it doesn't know.",
  },
  {
    title: "Not betting advice",
    body: "Nothing here is a recommendation to wager on anything. The project exists to demonstrate interpretable modeling, honest data provenance, and clean product execution — not to predict the World Cup.",
  },
];

export default function LimitationsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Limitations
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A forecast is only as honest as its caveats. Here is everything this
          project deliberately does not claim.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {limitations.map((l, i) => (
          <Card key={l.title}>
            <CardHeader title={`${i + 1} · ${l.title}`} />
            <p className="px-6 py-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {l.body}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
