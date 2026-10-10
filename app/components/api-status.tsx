/**
 * Purpose: the home route's status line (Sprint 09): reads /api/v1/health once and says whether the read API answers and
 *          whether the snapshot is current. Entries stay closed unless the health says `ok` (K-11): the entry panel
 *          (Sprint 11) will read the same flag.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
"use client";

import { useEffect, useState } from "react";

import { api, entriesAllowed, type Health } from "@/lib/api-client";

type Load = { health: Health | null; error: string | null };

export function ApiStatus() {
  const [load, setLoad] = useState<Load>({ health: null, error: null });
  useEffect(() => {
    let live = true;
    api
      .getHealth()
      .then((health) => live && setLoad({ health, error: null }))
      .catch(
        (error: unknown) => live && setLoad({ health: null, error: error instanceof Error ? error.name : "error" }),
      );
    return () => {
      live = false;
    };
  }, []);
  if (load.error) return <p className="text-sm text-dim">The read API did not answer ({load.error}).</p>;
  if (!load.health) return <p className="text-sm text-dim">Reading the chain snapshot…</p>;
  const { health } = load;
  return (
    <p className="text-sm text-dim">
      Snapshot: {health.status}
      {health.as_of_slot ? ` · slot ${health.as_of_slot}` : ""} · entries {entriesAllowed(health) ? "open" : "closed"}
    </p>
  );
}
