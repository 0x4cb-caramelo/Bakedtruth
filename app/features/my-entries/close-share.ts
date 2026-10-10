/**
 * Purpose: a creator share paid by the campaign's close (the Sprint 12 security review, M1). A share the program kept
 *          in the vault (the creator's wallet was empty) is paid to the creator by `close_campaign` with the rents when
 *          the creator is the rent payer, which an opener always is; that close emits only `CampaignClosed`, so no
 *          `CreatorShareSettled` ever names it. For each campaign this wallet closed as rent payer with no
 *          `CreatorShareSettled` for it, the campaign's own history is read: a `CampaignFinalized` with a share
 *          (`from_pot + from_fee`, the stored share) and no `CreatorShareSettled` at all means the share left with the
 *          close. Received is still read only from the program's events.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * Bounded: the campaign's last 100 transactions; a campaign whose finalize lies further back is left out (shown less,
 * never more). The program could say it itself at its next upgrade, with a `CreatorShareSettled` from the close.
 */
import { address } from "@solana/kit";
import { type DecodedEvent, type SolanaRpc } from "@brot/sdk/read";

import { eventsIn } from "./events-in";

const AT_ONCE = 4;

/** The share each closed campaign paid `wallet` with its close, by campaign address. */
export async function sharesPaidAtClose(
  rpc: SolanaRpc,
  wallet: string,
  events: readonly DecodedEvent[],
): Promise<Map<string, bigint>> {
  const settled = new Set(
    events.flatMap((e) => (e.name === "CreatorShareSettled" && e.data.creator === wallet ? [e.data.campaign] : [])),
  );
  const closed = events.flatMap((e) =>
    e.name === "CampaignClosed" && e.data.rentPayer === wallet && !settled.has(e.data.campaign)
      ? [e.data.campaign]
      : [],
  );
  const paid = new Map<string, bigint>();
  for (const campaign of new Set(closed)) {
    const sigs = await rpc.getSignaturesForAddress(address(campaign), { limit: 100, commitment: "confirmed" }).send();
    const landed = sigs.filter((s) => s.err === null).map((s) => s.signature as string);
    const found: DecodedEvent[] = [];
    for (let i = 0; i < landed.length; i += AT_ONCE) {
      const batch = await Promise.all(landed.slice(i, i + AT_ONCE).map((sig) => eventsIn(rpc, sig)));
      for (const list of batch) {
        found.push(...(list ?? []).filter((e) => (e.data as { campaign?: string }).campaign === campaign));
      }
    }
    if (found.some((e) => e.name === "CreatorShareSettled")) continue;
    const finalized = found.find((e) => e.name === "CampaignFinalized");
    if (finalized?.name !== "CampaignFinalized") continue;
    const share = finalized.data.fromPot + finalized.data.fromFee;
    if (share > 0n) paid.set(campaign, share);
  }
  return paid;
}
