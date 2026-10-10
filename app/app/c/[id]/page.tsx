/**
 * Purpose: one campaign by its id, the client-drawn u64 (TP §3.4.1): the campaign page and its entry panel (Sprint 11).
 *          The server only passes the route's id and the link's prefill (`?side=yes|no`, `?amount=<lamports>`; TP §3.6
 *          "Links": a link prefills the panel and never signs); the page reads the chain in the browser.
 * Version: 0.2.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { CampaignPage } from "@/features/campaign-page/campaign-page";
import type { Prefill } from "@/features/entry/entry-panel";

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
  return (
    <section className="py-2">
      <CampaignPage idParam={id} prefill={prefillOf(query)} />
    </section>
  );
}
