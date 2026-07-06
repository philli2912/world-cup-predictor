import type { KnockoutContext } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { FreshnessBadge } from "./FreshnessBadge";
import { MatchRow } from "./MatchRow";

export function KnockoutContextSection({
  context,
}: {
  context: KnockoutContext | null;
}) {
  if (!context) {
    return (
      <Card>
        <CardHeader
          title="Current knockout context"
          aside={<Badge tone="warning">data unavailable</Badge>}
        />
        <p className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
          No tournament snapshot is available. Run{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
            npm run update-data
          </code>{" "}
          to fetch the current bracket, then rebuild.
        </p>
      </Card>
    );
  }

  const recentCompleted = context.completedMatches.slice(-6);
  const earlierCompleted = context.completedMatches.slice(0, -6);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Current knockout context
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {context.tournamentLabel} · fetched from{" "}
            <a
              href={context.source.url}
              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:decoration-zinc-700 dark:hover:text-zinc-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              {context.source.name}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(context.dataStatus)}>
            {context.dataStatus}
          </Badge>
          <FreshnessBadge fetchedAt={context.fetchedAt} />
        </div>
      </div>

      {context.notes.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25">
          {context.notes.join(" ")}
        </p>
      )}

      <Card>
        <CardHeader
          title="Upcoming fixtures"
          subtitle="Highlighted rows are the next matchups with both teams confirmed"
        />
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {context.upcomingMatches.length === 0 ? (
            <p className="px-6 py-6 text-sm text-zinc-500">
              No upcoming fixtures in the snapshot.
            </p>
          ) : (
            context.upcomingMatches.map((m) => <MatchRow key={m.id} match={m} />)
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent results"
            subtitle="Winner shown in bold — penalty shootouts noted"
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentCompleted.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
            {earlierCompleted.length > 0 && (
              <details>
                <summary className="cursor-pointer px-6 py-3 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  Show {earlierCompleted.length} earlier results
                </summary>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {earlierCompleted.map((m) => (
                    <MatchRow key={m.id} match={m} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Quarter-final paths"
            subtitle="Derived from the official bracket placeholders"
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {context.quarterFinalPaths.length === 0 ? (
              <p className="px-6 py-6 text-sm text-zinc-500">
                Paths unavailable from the current data source.
              </p>
            ) : (
              context.quarterFinalPaths.map((p) => (
                <div key={p.quarterFinalId} className="px-6 py-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {p.quarterFinalId} · fed by {p.feederMatchIds.join(", ")}
                  </span>
                  <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">
                    {p.label}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
