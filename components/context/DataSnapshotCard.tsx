import type { KnockoutContext } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { FreshnessBadge } from "./FreshnessBadge";

const utcFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const legend: { label: string; tone: Parameters<typeof Badge>[0]["tone"]; meaning: string }[] = [
  { label: "Completed result", tone: "confirmed", meaning: "an official outcome from the fetched snapshot" },
  { label: "Upcoming fixture", tone: "upcoming", meaning: "scheduled but not yet played at snapshot time" },
  { label: "Demo prediction", tone: "demo", meaning: "model output from placeholder inputs — illustrative only" },
  { label: "No model data", tone: "warning", meaning: "team not in the demo dataset; no prediction is invented" },
];

export function DataSnapshotCard({ context }: { context: KnockoutContext }) {
  return (
    <Card>
      <CardHeader
        title="Data snapshot"
        subtitle="Everything below reads from a static JSON snapshot committed to the repository"
        aside={<FreshnessBadge fetchedAt={context.fetchedAt} />}
      />
      <div className="px-6 py-4">
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Source
            </dt>
            <dd className="text-zinc-700 dark:text-zinc-300">
              <a
                href={context.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:decoration-zinc-700 dark:hover:text-zinc-100"
              >
                {context.source.name}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Fetched at
            </dt>
            <dd className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {utcFormat.format(new Date(context.fetchedAt))} UTC
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Data status
            </dt>
            <dd>
              <Badge tone={statusTone(context.dataStatus)}>
                {context.dataStatus}
              </Badge>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Last updated
            </dt>
            <dd className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {utcFormat.format(new Date(context.fetchedAt))} UTC — refreshed
              only when the snapshot is re-fetched and redeployed
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Labels used across the app
          </p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {legend.map((l) => (
              <li key={l.label} className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Badge tone={l.tone}>{l.label}</Badge>
                <span>{l.meaning}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Provenance: a data script fetches fixtures/results, normalizes them
          into <code className="font-mono">data/knockoutContext.json</code>,
          and the app is built statically from that file — no live fetching in
          the browser. The snapshot, its timestamps, and{" "}
          <code className="font-mono">docs/prediction-log.md</code> are
          committed to git, so the repository history documents what was known
          at build time.
        </p>
      </div>
    </Card>
  );
}
