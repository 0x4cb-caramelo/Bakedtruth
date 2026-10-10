/**
 * Purpose: one campaign by its id, the client-drawn u64 (TP §3.4.1): the campaign page and its entry panel (Sprint 11).
 *          The server only passes the route's id and the link's prefill (`?side=yes|no`, `?amount=<lamports>`; TP §3.6
 *          "Links": a link prefills the panel and never signs); the page reads the chain in the browser. Since Sprint
 *          12 it also passes the team's void notes, read here on the server from content/void-log/; since Sprint 13,
 *          whether the team unlisted this campaign after a report (content/unlisted.json, C-10).
 * Version: 0.4.0
 * Sprint:  11 (site: campaign page and entry); 12; 13
 */
import { CampaignPage } from "@/features/campaign-page/campaign-page";
import type { VoidNote } from "@/features/campaign-page/void-note";
import type { Prefill } from "@/features/entry/entry-panel";
import { loadVoidLog } from "@/features/record/load-void-log";
import { loadUnlisted } from "@/features/report/unlisted";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** The prefill a link may carry: a side, and an amount in lamports from 1 up to 1,000,000 SOL; anything else is dropped. */
function prefillOf(query: Record<string, string | string[] | undefined>): Prefill {
  const side = one(query.side);
  const amount = one(query.amount);
  const lamports =
    amount && /^\d{1,15}$/.test(amount) && amount !== "0".repeat(amount.length) ? BigInt(amount) : undefined;
  return { side: side === "yes" || side === "no" ? side : undefined, amount: lamports };
}

export default async function Page(props: PageProps<"/c/[id]">) {
  const { id } = await props.params;
  const query = await props.searchParams;
  // The team's void notes, read on the server from content/void-log/; the page shows one only when its hash is the
  // one the chain stored for this campaign.
  const notes: VoidNote[] = loadVoidLog().records.flatMap((r) =>
    r.kind === "void" ? [{ file: r.file, campaign: r.campaign, reason: r.reason, text: r.text, sha256: r.sha256 }] : [],
  );
  const unlisted = loadUnlisted().find((u) => u.id === id) ?? null;
  return (
    <section className="py-2">
      <CampaignPage idParam={id} prefill={prefillOf(query)} notes={notes} unlisted={unlisted} />
    </section>
  );
}
