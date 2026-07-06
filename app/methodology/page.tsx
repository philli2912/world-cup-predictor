import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { teams } from "@/lib/model/teams";
import { factorLabels, PROBABILITY_SCALE, weights } from "@/lib/model/weights";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the knockout predictor's interpretable team strength model works: factors, weights, normalization, and the probability curve.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Methodology
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The model is deliberately simple: three public signals, fixed
          weights, one curve. Everything a prediction says can be traced to
          the numbers below.
        </p>
      </header>

      <Card>
        <CardHeader
          title="1 · Team strength score"
          subtitle="A weighted blend of three factors, each normalized to 0–100 across the dataset"
        />
        <div className="px-6 py-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <div className="mb-4 overflow-x-auto rounded-xl bg-zinc-50 p-4 font-mono text-xs text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
            strength = {weights.elo} × elo + {weights.fifaRanking} × fifaRank +{" "}
            {weights.worldCupHistory} × wcHistory
          </div>
          <ul className="flex flex-col gap-3">
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                {factorLabels.elo} ({weights.elo * 100}%)
              </strong>{" "}
              — the strongest single predictor of match outcomes in football
              analytics. It rewards recent results, weighted by opponent
              strength.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                {factorLabels.fifaRanking} ({weights.fifaRanking * 100}%)
              </strong>{" "}
              — the official ranking, inverted so rank #1 scores highest. It
              moves slowly, adding stability that raw Elo lacks.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                {factorLabels.worldCupHistory} ({weights.worldCupHistory * 100}
                %)
              </strong>{" "}
              — a 0–100 pedigree score for tournament track record. A modest
              nod to the observation that traditional powers tend to outperform
              in knockouts.
            </li>
          </ul>
          <p className="mt-4">
            Each factor is min–max normalized across the {teams.length}-team
            dataset, so scores are relative to this field — not absolute
            measures.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="2 · From strength gap to win probability"
          subtitle="An Elo-style logistic curve"
        />
        <div className="px-6 py-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <div className="mb-4 overflow-x-auto rounded-xl bg-zinc-50 p-4 font-mono text-xs text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
            P(A wins) = 1 / (1 + 10^((strengthB − strengthA) /{" "}
            {PROBABILITY_SCALE}))
          </div>
          <p>
            A {PROBABILITY_SCALE}-point strength gap corresponds to 10:1 odds;
            equal strengths give 50/50. The scale constant was chosen by hand
            so that typical gaps in this dataset produce plausible-looking
            probabilities — it is <em>not</em> calibrated against historical
            results. &ldquo;Win&rdquo; here means advancing (extra time and
            penalties included); the model doesn&apos;t predict draws or
            scorelines.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="3 · Data sources"
          aside={<Badge tone="demo">demo model values</Badge>}
        />
        <div className="px-6 py-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <ul className="flex flex-col gap-3">
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Team strength inputs
              </strong>{" "}
              — hand-set placeholder values in{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
                lib/model/teams.ts
              </code>
              , chosen to be plausible but not fetched from any documented
              source. Every output derived from them is labeled{" "}
              <em>demo model values</em>.
            </li>
            <li>
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                Tournament fixtures &amp; results
              </strong>{" "}
              — fetched by a data script from a FIFA website data endpoint
              (with a public ESPN feed as fallback) and committed as a static
              JSON snapshot with source URL and fetch timestamp. The endpoint
              is not a stable documented API and may change; the script fails
              loudly rather than inventing fixtures.
            </li>
          </ul>
          <p className="mt-4">
            The two layers never mix: bracket data describes{" "}
            <em>what is actually happening</em>, model data produces{" "}
            <em>hypothetical estimates</em>. Real teams without model data get
            no prediction.
          </p>
        </div>
      </Card>

      <p className="text-sm text-zinc-500">
        Honest about what this isn&apos;t?{" "}
        <Link
          href="/limitations"
          className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Read the limitations →
        </Link>
      </p>
    </div>
  );
}
