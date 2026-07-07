import type { KnockoutMatch } from "@/lib/types";
import { Badge, statusTone } from "@/components/ui/Badge";
import { findTeamByName } from "@/lib/model/teams";

function TeamSlot({
  team,
  placeholder,
  isWinner,
}: {
  team: KnockoutMatch["teamA"];
  placeholder: string | null;
  isWinner: boolean;
}) {
  if (!team) {
    return (
      <span className="text-sm italic text-zinc-400 dark:text-zinc-500">
        {placeholder ?? "Pending confirmation"}
      </span>
    );
  }
  return (
    <span
      className={`text-sm ${
        isWinner
          ? "font-semibold text-zinc-900 dark:text-zinc-100"
          : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      {team.name}
      <span className="ml-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
        {team.code}
      </span>
    </span>
  );
}

const kickoffFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function MatchRow({ match }: { match: KnockoutMatch }) {
  const finished = match.status === "confirmed result";
  // Flag upcoming fixtures the predictor can't model — the app never
  // invents strength values for teams outside the active-team dataset.
  const lacksModelData =
    !finished &&
    match.teamA &&
    match.teamB &&
    (!findTeamByName(match.teamA.name) || !findTeamByName(match.teamB.name));

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-3 ${
        match.highlighted ? "bg-sky-50/50 dark:bg-sky-500/[0.04]" : ""
      }`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {match.round} · {match.id}
        </span>
        <div className="flex flex-wrap items-center gap-x-2">
          <TeamSlot
            team={match.teamA}
            placeholder={match.placeholderA}
            isWinner={finished && match.winner === match.teamA?.name}
          />
          <span className="text-xs text-zinc-300 dark:text-zinc-600">vs</span>
          <TeamSlot
            team={match.teamB}
            placeholder={match.placeholderB}
            isWinner={finished && match.winner === match.teamB?.name}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {finished && match.score ? (
          <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {match.score.a}–{match.score.b}
            {match.penalties ? (
              <span className="ml-1.5 text-xs font-normal text-zinc-500">
                ({match.penalties.a}–{match.penalties.b} pens)
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {kickoffFormat.format(new Date(match.kickoffUtc))} UTC
          </span>
        )}
        {lacksModelData ? <Badge tone="warning">no model data</Badge> : null}
        <Badge tone={statusTone(match.status)}>
          {finished ? "completed result" : match.status}
        </Badge>
      </div>
    </div>
  );
}
