"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

/**
 * Computes staleness in the browser so a statically built page still
 * shows an honest "last updated" signal. Renders nothing until mounted
 * to avoid a server/client time mismatch.
 */
export function FreshnessBadge({ fetchedAt }: { fetchedAt: string }) {
  const [ageHours, setAgeHours] = useState<number | null>(null);

  useEffect(() => {
    const compute = () =>
      setAgeHours((Date.now() - new Date(fetchedAt).getTime()) / 3_600_000);
    compute();
    const timer = setInterval(compute, 60_000);
    return () => clearInterval(timer);
  }, [fetchedAt]);

  if (ageHours === null) return <Badge tone="neutral">last updated —</Badge>;

  const label =
    ageHours < 1
      ? "under an hour ago"
      : ageHours < 48
        ? `${Math.round(ageHours)}h ago`
        : `${Math.round(ageHours / 24)}d ago`;

  return ageHours > 24 ? (
    <Badge tone="warning">may be stale · updated {label}</Badge>
  ) : (
    <Badge tone="neutral">last updated {label}</Badge>
  );
}
