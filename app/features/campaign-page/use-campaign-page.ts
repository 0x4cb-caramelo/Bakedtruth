/**
 * Purpose: the campaign page's data (load.ts) in React: read once, then again every 20 seconds while the tab is visible
 *          (a devnet price updates about once a minute), and on demand after an entry lands. A failed read keeps the
 *          last good one on screen, marked as failed; an id that names no campaign is "missing" (Sprint 12: or closed,
 *          when the address has history: every payout went out and the account was closed). Also whether the site
 *          takes entries now (K-11: the read API's health, the switch Sprint 09 wired).
 * Version: 0.2.0 (Sprint 12: a closed campaign account)
 * Sprint:  11 (site: campaign page and entry); 12
 */
import { useCallback, useEffect, useState } from "react";

import { api, entriesAllowed } from "@/lib/api-client";
import { rpc } from "@/lib/rpc";
import { campaignClosed, loadCampaignPage, type PageData } from "./load";

export type PageState =
  | { status: "loading" }
  /** No campaign account at the id's address; `closed` when its address has history (the account was closed). */
  | { status: "missing"; closed: boolean }
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
      .then(async (data) => {
        if (data) return live && setState({ status: "ready", data, failed: false });
        const closed = await campaignClosed(rpc, id).catch(() => false);
        if (live) setState({ status: "missing", closed });
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

  return { state: id === null ? ({ status: "missing", closed: false } as const) : state, reload };
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
