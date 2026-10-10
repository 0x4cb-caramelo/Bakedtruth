/**
 * Purpose: the campaign page's data (load.ts) in React: read once, then again every 20 seconds while the tab is visible
 *          (a devnet price updates about once a minute), and on demand after an entry lands. A failed read keeps the
 *          last good one on screen, marked as failed; an id that names no campaign is "missing". Also whether the site
 *          takes entries now (K-11: the read API's health, the switch Sprint 09 wired).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { useCallback, useEffect, useState } from "react";

import { api, entriesAllowed } from "@/lib/api-client";
import { rpc } from "@/lib/rpc";
import { loadCampaignPage, type PageData } from "./load";

export type PageState =
  | { status: "loading" }
  | { status: "missing" }
  /** The first read failed; the page tries again on its timer. */
  | { status: "error" }
  | { status: "ready"; data: PageData; failed: boolean };

const REFRESH_MS = 20_000;

export function useCampaignPage(id: bigint | null, wallet: string | null) {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [round, setRound] = useState(0);
  const reload = useCallback(() => setRound((n) => n + 1), []);

  useEffect(() => {
    if (id === null) return;
    let live = true;
    loadCampaignPage(rpc, id, wallet)
      .then((data) => {
        if (live) setState(data ? { status: "ready", data, failed: false } : { status: "missing" });
      })
      .catch(() => {
        if (live) setState((last) => (last.status === "ready" ? { ...last, failed: true } : { status: "error" }));
      });
    return () => {
      live = false;
    };
  }, [id, wallet, round]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [reload]);

  return { state: id === null ? ({ status: "missing" } as const) : state, reload };
}

/** K-11: entries are taken only while the read API says so; `null` while it is asked. */
export function useEntriesAllowed(): boolean | null {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    api
      .getHealth()
      .then((health) => live && setAllowed(entriesAllowed(health)))
      .catch(() => live && setAllowed(false));
    return () => {
      live = false;
    };
  }, []);
  return allowed;
}
