/**
 * Purpose: the home page (the UI overhaul; the approved prototype's home.js): the top line with the opening's cost, the
 *          mosaic ("Open now" and the two side boxes), how it works, then the toolbar and the grid. One read of the
 *          campaigns (the read API) and one batched read of their accounts feed every part; a campaign the team
 *          unlisted after a report (C-10) counts as unlisted everywhere, and only listed campaigns that take entries
 *          lead the carousel, in ranking order.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";

import { arrange, DEFAULT_FILTERS } from "@/features/campaigns/arrange";
import { CampaignList } from "@/features/campaigns/campaign-list";
import { getSaved, subscribeSaved, toggleSaved } from "@/features/campaigns/saved";
import { useCampaigns } from "@/features/campaigns/use-campaigns";
import { useReadings } from "@/features/campaigns/use-readings";
import type { Card } from "@/features/campaigns/model";
import { HOME } from "./copy";
import { HomeFeature } from "./home-feature";
import { HomeHow } from "./home-how";
import { HomeLead } from "./home-lead";
import { HomeSide } from "./home-side";

const NO_SAVED = new Set<string>();
const serverSaved = () => NO_SAVED;
const NONE: readonly Card[] = [];

export function HomePage({ unlisted }: { unlisted: readonly { id: string; opensAt: string }[] }) {
  const loaded = useCampaigns();
  const saved = useSyncExternalStore(subscribeSaved, getSaved, serverSaved);
  const cards = useMemo(() => {
    if (loaded.status !== "ready") return NONE;
    const hidden = new Set(unlisted.map((u) => `${u.id}@${u.opensAt}`));
    return loaded.cards.map((c) => (hidden.has(`${c.id}@${c.opensAt ?? ""}`) ? { ...c, listed: false } : c));
  }, [loaded, unlisted]);
  const now = loaded.status === "ready" ? loaded.chainTime : 0n;
  const featured = useMemo(
    () => arrange(cards, { ...DEFAULT_FILTERS, state: "open" }, NO_SAVED).filter((c) => c.entriesCloseAt !== null && c.entriesCloseAt > now).slice(0, 5),
    [cards, now],
  );
  const readings = useReadings(cards);
  const loading = loaded.status === "loading";
  return (
    <>
      <HomeLead />
      {loaded.status === "error" ? (
        <div className="notice danger" role="alert">
          <AlertTriangle className="size-[18px]" aria-hidden="true" />
          <p>
            <b>{HOME.loadFailed}</b> {HOME.loadFailedNote}
          </p>
        </div>
      ) : (
        <div className="home-mosaic">
          <HomeFeature
            cards={featured}
            loading={loading}
            now={now}
            readings={readings}
            saved={saved}
            onToggle={toggleSaved}
          />
          <HomeSide cards={cards} now={now} loading={loading} />
        </div>
      )}
      <HomeHow />
      {loaded.status === "ready" ? (
        <CampaignList cards={cards} now={now} readings={readings} saved={saved} onToggle={toggleSaved} />
      ) : null}
    </>
  );
}
