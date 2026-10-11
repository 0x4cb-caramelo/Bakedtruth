/**
 * Purpose: the creation box's data in React: the draft, the chain as the box reads it (once, then every 15 seconds
 *          while the tab is visible), the draft's own accounts (the account in its slot and the campaign's address for
 *          the box's id), the site's switch, the wallet and its balance, and the verdict `checkBox` returns on every
 *          change (A-10: the SDK's mirror of the program, in its order). A deadline given in days becomes a moment, on
 *          the minute, once the chain's clock is known (A-7). The id is this wallet's saved one, or one drawn for this
 *          page and saved only at "Review and sign".
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { randomCampaignId } from "@brot/sdk/tx";

import { rpc } from "@/lib/rpc";
import { useEntriesAllowed } from "../campaign-page/use-campaign-page";
import { layeredStore, type KeyValueStore } from "../entry/retry-guard";
import { browserStore } from "../entry/use-rents";
import { useSolBalance } from "../wallet/use-sol-balance";
import { checkBox, type BoxCheck, type BoxInputs } from "./check";
import { accountOf, daysFrom, type Draft } from "./draft";
import { readDraftAccounts, readWorld, type BoxWorld } from "./reads";
import { loadOpening, pruneSettledOpenings } from "./retry-guard";

const REFRESH_MS = 15_000;
const ACCOUNT_DEBOUNCE_MS = 400;

/** The browser's store with this page's memory first; settled opening records older than a day are deleted. */
export function openingStore(): KeyValueStore & { persists: boolean } {
  const local = browserStore();
  pruneSettledOpenings(local as Parameters<typeof pruneSettledOpenings>[0], Date.now());
  return layeredStore(local);
}

export function useOpenBox(initial: Draft) {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [landings, setLandings] = useState(0);
  const balance = useSolBalance(landings);
  const siteAllows = useEntriesAllowed();
  const store = useMemo(() => openingStore(), []);
  const [draft, setDraft] = useState<Draft>(initial);
  const [world, setWorld] = useState<BoxWorld | null>(null);
  const [readFailed, setReadFailed] = useState(false);
  const [accounts, setAccounts] = useState<{ metric: string; id: bigint; value: BoxInputs["accounts"] } | null>(null);
  const [check, setCheck] = useState<BoxCheck | null>(null);
  const [tick, setTick] = useState(0);
  const pageIds = useRef(new Map<string, bigint>());

  /** This page's id for a wallet, drawn once (randomly, never from the device's clock) until a campaign sits at it. */
  const pageIdNow = useCallback((who: string | null): bigint => {
    const key = who ?? "";
    const known = pageIds.current.get(key);
    if (known !== undefined) return known;
    const drawn = randomCampaignId();
    pageIds.current.set(key, drawn);
    return drawn;
  }, []);
  /** The id this wallet's opening uses now: its saved record's, or this page's. */
  const idNow = (): bigint => {
    const saved = wallet ? loadOpening(store, wallet) : null;
    return saved ? BigInt(saved.id) : pageIdNow(wallet);
  };

  useEffect(() => {
    let live = true;
    const read = () =>
      readWorld(rpc)
        .then((next) => {
          if (!live) return;
          setWorld(next);
          setReadFailed(false);
          setDraft((d) =>
            d.deadline && "days" in d.deadline
              ? { ...d, deadline: { at: daysFrom(next.clock.unixTimestamp, d.deadline.days) } }
              : d,
          );
        })
        .catch(() => live && setReadFailed(true));
    read();
    const timer = setInterval(() => document.visibilityState === "visible" && read(), REFRESH_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [tick]);

  const metric = accountOf(draft);
  const accountsKey = `${wallet ?? ""}|${draft.kind}|${metric ?? ""}|${world?.clock.slot ?? ""}|${landings}`;
  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      const id = idNow();
      readDraftAccounts(rpc, id, metric)
        .then((value) => live && setAccounts({ metric: metric ?? "", id, value }))
        .catch(() => live && setAccounts({ metric: metric ?? "", id, value: null }));
    }, ACCOUNT_DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
    // idNow reads the store and this page's ref: the key carries everything that changes its answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsKey]);

  // The accounts read for another slot value are not this draft's: the account check waits for its own read.
  const current = accounts && accounts.metric === (metric ?? "") ? accounts : null;
  const draftAccounts = current?.value ?? null;
  /** Read the chain again now (after an opening landed, or "Check again"). */
  const refresh = useCallback(() => {
    setTick((n) => n + 1);
    setLandings((n) => n + 1);
  }, []);
  /** A campaign now sits at this page's id for `who` (theirs, or another wallet's): the next opening draws anew. */
  const redraw = useCallback((who: string) => {
    pageIds.current.set(who, randomCampaignId());
  }, []);
  const boxId = current?.id ?? 0n;
  useEffect(() => {
    let live = true;
    const input: BoxInputs = {
      draft,
      world,
      accounts: draftAccounts,
      readFailed,
      id: boxId,
      wallet,
      balance,
      siteAllows,
    };
    checkBox(input)
      .then((next) => live && setCheck(next))
      .catch(() => live && setCheck(null));
    return () => {
      live = false;
    };
  }, [draft, world, draftAccounts, boxId, readFailed, wallet, balance, siteAllows]);

  return {
    draft,
    setDraft,
    world,
    check,
    wallet,
    balance,
    store,
    accounts: draftAccounts,
    accountsRead: current !== null,
    pageIdNow,
    redraw,
    refresh,
  };
}
