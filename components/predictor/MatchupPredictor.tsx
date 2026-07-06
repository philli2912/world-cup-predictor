"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getTeam } from "@/lib/model/teams";
import { predictMatchup } from "@/lib/model/predict";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProbabilityResult } from "./ProbabilityResult";
import { StrengthBreakdown } from "./StrengthBreakdown";
import { TeamSelect } from "./TeamSelect";

export interface QuickPick {
  label: string;
  round: string;
  teamAId: string;
  teamBId: string;
}

export function MatchupPredictor({
  quickPicks = [],
  initialA = "france",
  initialB = "argentina",
}: {
  quickPicks?: QuickPick[];
  initialA?: string;
  initialB?: string;
}) {
  const [idA, setIdA] = useState(initialA);
  const [idB, setIdB] = useState(initialB);

  const prediction = useMemo(() => {
    const teamA = getTeam(idA);
    const teamB = getTeam(idB);
    if (!teamA || !teamB || teamA.id === teamB.id) return null;
    return predictMatchup(teamA, teamB);
  }, [idA, idB]);

  return (
    <div className="flex flex-col gap-6">
      {quickPicks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            From the live bracket:
          </span>
          {quickPicks.map((qp) => (
            <button
              key={qp.label}
              onClick={() => {
                setIdA(qp.teamAId);
                setIdB(qp.teamBId);
              }}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col items-end gap-3 sm:flex-row">
          <TeamSelect label="Team A" value={idA} exclude={idB} onChange={setIdA} />
          <button
            onClick={() => {
              setIdA(idB);
              setIdB(idA);
            }}
            aria-label="Swap teams"
            title="Swap teams"
            className="h-11 shrink-0 rounded-xl border border-zinc-300 px-4 text-sm text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
          >
            ⇄
          </button>
          <TeamSelect label="Team B" value={idB} exclude={idA} onChange={setIdB} />
        </div>
      </Card>

      {prediction ? (
        <>
          <Card className="p-6">
            <ProbabilityResult prediction={prediction} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Why the model leans this way"
                subtitle="Factors ordered by influence on this matchup"
                aside={<Badge tone="demo">demo model values</Badge>}
              />
              <ul className="flex flex-col gap-2.5 px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                {prediction.explanation.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                title="Strength score inputs"
                subtitle="Green marks the stronger value per factor"
                aside={<Badge tone="demo">demo model values</Badge>}
              />
              <div className="px-6 py-2">
                <StrengthBreakdown prediction={prediction} />
              </div>
            </Card>
          </div>

          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            Demo estimate from placeholder inputs — not betting advice. See{" "}
            <Link href="/methodology" className="underline underline-offset-2">
              how this is calculated
            </Link>{" "}
            and{" "}
            <Link href="/limitations" className="underline underline-offset-2">
              what it can&apos;t tell you
            </Link>
            .
          </p>
        </>
      ) : (
        <Card className="p-6">
          <p className="text-center text-sm text-zinc-500">
            Select two different teams to see a prediction.
          </p>
        </Card>
      )}
    </div>
  );
}
