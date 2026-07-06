import type { MatchupPrediction } from "@/lib/types";

export function ProbabilityResult({
  prediction,
}: {
  prediction: MatchupPrediction;
}) {
  const { a, b, probabilityA, probabilityB, favored } = prediction;
  const pctA = Math.round(probabilityA * 100);
  const pctB = 100 - pctA;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        The model favors{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {favored.flag} {favored.name}
        </span>{" "}
        in this matchup.
      </p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {pctA}%
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            {a.team.flag} {a.team.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
            {pctB}%
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            {b.team.flag} {b.team.name}
          </p>
        </div>
      </div>

      <div
        className="flex h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="img"
        aria-label={`${a.team.name} ${pctA}%, ${b.team.name} ${pctB}%`}
      >
        <div
          className="rounded-l-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-500"
          style={{ width: `${probabilityA * 100}%` }}
        />
        <div
          className="rounded-r-full bg-gradient-to-r from-zinc-300 to-zinc-400 transition-[width] duration-500 dark:from-zinc-600 dark:to-zinc-500"
          style={{ width: `${probabilityB * 100}%` }}
        />
      </div>
    </div>
  );
}
