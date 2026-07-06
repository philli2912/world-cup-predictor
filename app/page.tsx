import Link from "next/link";
import { loadKnockoutContext } from "@/lib/knockout";
import { KnockoutContextSection } from "@/components/context/KnockoutContextSection";
import { Badge } from "@/components/ui/Badge";

const steps = [
  {
    title: "Blend three signals",
    body: "Each team gets a strength score from Elo rating (50%), FIFA ranking (30%), and World Cup history (20%) — weights chosen for interpretability, not fitted to outcomes.",
  },
  {
    title: "Compare the gap",
    body: "The strength gap between two teams maps to a win probability through an Elo-style curve, so every output can be traced back to three inputs.",
  },
  {
    title: "Show the reasoning",
    body: "Every prediction lists which factors favored which team and by how much. No black box — if the model is wrong, you can see exactly why.",
  },
];

export default async function Home() {
  const context = await loadKnockoutContext();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6">
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge tone="demo">Portfolio project · demo model values</Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          Who wins a World Cup knockout tie?
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          An interpretable strength model that estimates win probabilities for
          any matchup — and shows its reasoning. Built to demonstrate
          forecasting and product thinking, not to beat the bookmakers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/predict"
            className="flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Try the predictor
          </Link>
          <Link
            href="/methodology"
            className="flex h-11 items-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
          >
            Read the methodology
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
              0{i + 1}
            </span>
            <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {s.body}
            </p>
          </div>
        ))}
      </section>

      <KnockoutContextSection context={context} />
    </div>
  );
}
