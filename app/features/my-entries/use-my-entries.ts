/**
 * Purpose: "My entries" data in React: the read API's campaign list (which campaigns exist now), the wallet's history
 *          from the chain (its events, one page at a time), then the campaigns and the wallet's entries from the chain
 *          (load.ts), turned into rows (model.ts). Read when the wallet connects, again after "Read older
 *          transactions" or a claim, and every 60 seconds while the tab is visible. The list is optional: without the
 *          API, the campaigns the history names are still read.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api-client";
import { rpc } from "@/lib/rpc";
import { EMPTY_HISTORY, readWalletHistory, type History } from "./history";
import { sharesPaidAtClose } from "./close-share";
import { loadMyEntries } from "./load";
import { myEntries, type Summary } from "./model";

export type MineState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; summary: Summary; history: History; apiDown: boolean; failed: boolean };

const REFRESH_MS = 60_000;
const PAGE = 100;

async function listed(): Promise<string[] | null> {
  try {
    const first = await api.listCampaigns({ limit: PAGE, offset: 0 });
    const all = first.campaigns.map((c) => c.address);
    for (let offset = all.length; offset < first.total; offset += PAGE) {
      all.push(...(await api.listCampaigns({ limit: PAGE, offset })).campaigns.map((c) => c.address));
    }
    return all;
  } catch {
    return null;
  }
}

type Done = Extract<MineState, { status: "ready" | "error" }>;

export function useMyEntries(wallet: string | null) {
  // Each result and history belongs to the wallet it was read for: another wallet starts from nothing.
  const [result, setResult] = useState<{ wallet: string; value: Done } | null>(null);
  const history = useRef<{ wallet: string | null; value: History }>({ wallet: null, value: EMPTY_HISTORY });
  const [round, setRound] = useState(0);
  const [older, setOlder] = useState(false);
  const reload = useCallback(() => setRound((n) => n + 1), []);
  const readOlder = useCallback(() => setOlder(true), []);

  useEffect(() => {
    if (!wallet) return;
    let live = true;
    const prior = history.current.wallet === wallet ? history.current.value : EMPTY_HISTORY;
    (async () => {
      // The newest page again (new settlements; only unread signatures are fetched), then one older page on request.
      const fresh = await readWalletHistory(rpc, wallet, prior, { newest: true });
      const read = older && fresh.before ? await readWalletHistory(rpc, wallet, fresh) : fresh;
      const campaigns = await listed();
      const named = read.events.map((e) => (e.data as { campaign?: string }).campaign).filter(Boolean) as string[];
      const data = await loadMyEntries(rpc, wallet, [...(campaigns ?? []), ...named]);
      const paidAtClose = await sharesPaidAtClose(rpc, wallet, read.events);
      if (!live) return;
      history.current = { wallet, value: read };
      setOlder(false);
      const summary = myEntries(wallet, data, read.events, paidAtClose);
      setResult({
        wallet,
        value: { status: "ready", summary, history: read, apiDown: campaigns === null, failed: false },
      });
    })().catch(() => {
      if (!live) return;
      setOlder(false);
      setResult((last) =>
        last?.wallet === wallet && last.value.status === "ready"
          ? { wallet, value: { ...last.value, failed: true } }
          : { wallet, value: { status: "error" } },
      );
    });
    return () => {
      live = false;
    };
  }, [wallet, round, older]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [reload]);

  const state: MineState = !wallet
    ? { status: "idle" }
    : result?.wallet === wallet
      ? result.value
      : { status: "loading" };
  return { state, reload, readOlder, readingOlder: older };
}
