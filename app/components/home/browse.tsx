"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import type { ClockInfo } from "@/lib/format";
import { useProgramActivity, type MarketEntry } from "@/lib/hooks";
import { questionText } from "@/lib/metric";
import { categoryOf, statusOf, type Category, type Status } from "@/lib/view";
import { ActivityFeed } from "@/components/activity-feed";
import { Card, Tabs } from "@/components/primitives";
import { MarketRow } from "@/components/home/market-tile";

const STATUSES: { id: Status; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "yes", label: "Resolved YES" },
  { id: "no", label: "Resolved NO" },
];

function ProgramActivity({ entries }: { entries: MarketEntry[] }) {
  const activity = useProgramActivity();
  const questions = new Map(
    entries.map((e) => [e.address.toBase58(), questionText(e.account, e.reading, e.name)] as const),
  );
  return (
    <Card className="px-5 py-2">
      {activity.data ? (
        <ActivityFeed
          items={activity.data.activity}
          now={activity.data.fetchedAt}
          questions={questions}
          empty="No activity on the program yet."
        />
      ) : (
        <div className="space-y-3 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse bg-raised/60" />
          ))}
        </div>
      )}
    </Card>
  );
}

/** Rows on a tape, with a rail on the left whose lit stretch follows the row under the pointer. */
function Tape({ entries, clock }: { entries: MarketEntry[]; clock: ClockInfo | null }) {
  const [beam, setBeam] = useState<{ top: number; height: number } | null>(null);
  return (
    <div className="relative lg:pl-[78px]">
      <div aria-hidden="true" className="absolute top-0 bottom-0 left-[34px] hidden w-0.5 bg-line lg:block">
        {beam && (
          <span
            className="absolute -left-0.5 w-1.5 bg-crust shadow-[0_0_14px_var(--color-crust)] transition-[top,height] duration-150 ease-[steps(4)]"
            style={beam}
          />
        )}
      </div>
      <div
        className="border-t-2 border-line"
        onPointerOver={(e) => {
          const row = (e.target as HTMLElement).closest("article");
          if (row) setBeam({ top: row.offsetTop, height: row.offsetHeight });
        }}
        onPointerLeave={() => setBeam(null)}
      >
        {entries.map((entry) => (
          <MarketRow key={entry.address.toBase58()} entry={entry} clock={clock} />
        ))}
      </div>
    </div>
  );
}

/** "Markets / Activity", then the tape: status filter, search on small screens, and the rows. */
export function Browse({
  entries,
  clock,
  loading,
}: {
  entries: MarketEntry[];
  clock: ClockInfo | null;
  loading: boolean;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("active");
  const tab = params.get("tab") === "activity" ? "activity" : "markets";
  const category = params.get("category") as Category | null;
  const query = params.get("q") ?? "";

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/?${qs}#browse` : "/#browse", { scroll: false });
  };

  const needle = query.trim().toLowerCase();
  const matches = (e: MarketEntry) =>
    !needle ||
    questionText(e.account, e.reading, e.name).toLowerCase().includes(needle) ||
    e.address.toBase58().toLowerCase().includes(needle) ||
    e.account.targetPubkey.toBase58().toLowerCase().includes(needle) ||
    // A pool or metadata account names the market where its mint alone is shared by many.
    e.account.metricAccount.toBase58().toLowerCase().includes(needle);
  const inCategory = entries.filter((e) => (!category || categoryOf(e.account) === category) && matches(e));
  const shown = inCategory.filter((e) => statusOf(e.account) === status);
  const count = (s: Status) => inCategory.filter((e) => statusOf(e.account) === s).length;

  return (
    <section id="browse" className="scroll-mt-28 space-y-5">
      <Tabs
        size="lg"
        tabs={[
          { id: "markets", label: "Markets" },
          { id: "activity", label: "Activity" },
        ]}
        value={tab}
        onChange={(id) => setParam("tab", id === "activity" ? "activity" : null)}
      />

      {tab === "activity" ? (
        <ProgramActivity entries={entries} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 lg:pl-[78px]">
            <Tabs
              tabs={STATUSES.map((s) => ({
                id: s.id,
                label: (
                  <>
                    {s.label}
                    <span className="ml-1.5 text-xs tabular-nums text-dim">{loading ? "·" : count(s.id)}</span>
                  </>
                ),
              }))}
              value={status}
              onChange={setStatus}
            />
            <label className="flex h-10 w-full items-center gap-2 border-2 border-line bg-page px-3 text-sm focus-within:border-brand md:hidden">
              <Search className="size-4 text-dim" />
              <input
                value={query}
                onChange={(e) => setParam("q", e.target.value || null)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-dim"
                aria-label="Filter markets"
              />
            </label>
            {query && (
              <button type="button" onClick={() => setParam("q", null)} className="text-xs text-brand hover:underline">
                Clear “{query}”
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-0 lg:pl-[78px]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[74px] animate-pulse border-b-2 border-line bg-surface/60" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 border-2 border-dashed border-line py-12 text-sm text-dim">
              <Image
                src="/mascot/sulking.png"
                alt="Baked, sulking"
                width={170}
                height={108}
                className="h-auto w-[170px] [image-rendering:pixelated]"
              />
              Nothing on the tape here.
            </div>
          ) : (
            <Tape entries={shown} clock={clock} />
          )}
        </>
      )}
    </section>
  );
}
