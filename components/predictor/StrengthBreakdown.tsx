import type { FactorKey, MatchupPrediction } from "@/lib/types";
import { weights } from "@/lib/model/weights";

function formatRaw(key: FactorKey, raw: number): string {
  return key === "fifaRanking" ? `#${raw}` : String(Math.round(raw));
}

export function StrengthBreakdown({
  prediction,
}: {
  prediction: MatchupPrediction;
}) {
  const { a, b } = prediction;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <th className="py-2 pr-4 font-medium">Factor</th>
            <th className="py-2 pr-4 font-medium">Weight</th>
            <th className="py-2 pr-4 text-right font-medium">
              {a.team.code}
            </th>
            <th className="py-2 text-right font-medium">{b.team.code}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {a.factors.map((factorA, i) => {
            const factorB = b.factors[i];
            const aLeads = factorA.normalized > factorB.normalized;
            const bLeads = factorB.normalized > factorA.normalized;
            return (
              <tr key={factorA.factor}>
                <td className="py-2.5 pr-4 text-zinc-700 dark:text-zinc-300">
                  {factorA.label}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-zinc-400 dark:text-zinc-500">
                  {Math.round(weights[factorA.factor] * 100)}%
                </td>
                <td
                  className={`py-2.5 pr-4 text-right tabular-nums ${
                    aLeads
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500"
                  }`}
                >
                  {formatRaw(factorA.factor, factorA.raw)}
                </td>
                <td
                  className={`py-2.5 text-right tabular-nums ${
                    bLeads
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500"
                  }`}
                >
                  {formatRaw(factorB.factor, factorB.raw)}
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="py-2.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
              Blended strength
            </td>
            <td className="py-2.5 pr-4 tabular-nums text-zinc-400 dark:text-zinc-500">
              100%
            </td>
            <td className="py-2.5 pr-4 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {a.score.toFixed(1)}
            </td>
            <td className="py-2.5 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {b.score.toFixed(1)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="pb-3 pt-1 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">
        FIFA ranking (as of {a.team.provenance.fifaRanking.asOf}) and Elo
        rating (as of {a.team.provenance.elo.asOf}) are source-backed; World
        Cup history is a derived demo score.
      </p>
    </div>
  );
}
