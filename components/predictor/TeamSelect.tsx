"use client";

import { activeTeams } from "@/lib/model/teams";

export function TeamSelect({
  label,
  value,
  exclude,
  onChange,
}: {
  label: string;
  value: string;
  exclude?: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-white/10"
      >
        {activeTeams.map((t) => (
          <option key={t.id} value={t.id} disabled={t.id === exclude}>
            {t.flag} {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
