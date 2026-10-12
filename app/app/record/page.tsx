/**
 * Purpose: the public record at /record (Sprint 12; the route name confirmed by the founder with L-01): since Sprint 13,
 *          first who can do what (content/powers.md, BR-41) with its keys checked live against the chain, then the
 *          team's voids and corrections from content/void-log/. Both files are read on the server when the site is
 *          built; a change appears once it is committed (with two people's review) and the site is built again.
 * Version: 0.3.0 (Sprint 13: the powers table)
 * Sprint:  09 (site shell, theme and wallet); 12 (content); 13
 */
import type { Metadata } from "next";

import { LiveKeys } from "@/features/record/live-keys";
import { loadPowers } from "@/features/record/load-powers";
import { PowersView } from "@/features/record/powers-view";
import { RecordList } from "@/features/record/record-list";
import { loadVoidLog } from "@/features/record/load-void-log";

export const metadata: Metadata = { title: "Public record · Brot Markets" };

export default function Page() {
  const powers = loadPowers();
  return (
    <section className="space-y-8 py-2">
      <PowersView blocks={powers.blocks} />
      <LiveKeys published={powers.keys} />
      <RecordList log={loadVoidLog()} />
    </section>
  );
}
