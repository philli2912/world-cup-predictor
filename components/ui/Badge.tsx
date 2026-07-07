import type { ReactNode } from "react";

export type BadgeTone =
  | "confirmed"
  | "upcoming"
  | "demo"
  | "source"
  | "neutral"
  | "warning";

const tones: Record<BadgeTone, string> = {
  confirmed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25",
  upcoming:
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/25",
  source:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/25",
  demo:
    "bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/25",
  neutral:
    "bg-zinc-100 text-zinc-600 ring-zinc-500/15 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-500/20",
  warning:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/25",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Maps a match/data status string to a badge tone. */
export function statusTone(status: string): BadgeTone {
  if (status.includes("confirmed")) return "confirmed";
  if (status.includes("upcoming")) return "upcoming";
  if (status.includes("demo")) return "demo";
  if (status.includes("pending") || status.includes("unavailable"))
    return "warning";
  return "neutral";
}
