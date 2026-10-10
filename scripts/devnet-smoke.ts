/**
 * Purpose: the full cycle in SOL (Sprint 05 DoD, X0.2 and X0.5): a wallet outside the team opens a burn campaign
 *          and pays US$500 at the Pyth price after previewing the whole debit; the retried opening fails on its
 *          id; two wallets join YES and NO; a retried entry fails on `expected_entry_total`; the supply is burned
 *          to the target and the campaign resolves YES; the joins are tallied; a team key confirms; the winners
 *          and the creator are paid, Brot's fee collected, the campaign closed and the fee vault swept. Every
 *          amount is checked against the SDK's math. Exits 0 only if every check holds.
 * Version: 0.2.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; replaces the USDC smoke of the frozen program
 *
 *   bun run smoke:devnet                      # a local offline surfnet, in a loopback-only namespace (default)
 *   bun run smoke:devnet -- --cluster devnet  # devnet: the program deployed and initialized (deploy/devnet)
 *
 * On devnet: DEVNET_WALLET pays and funds the wallets (about 4.7 SOL per run at US$110/SOL), TEAM_KEYPAIR is
 * your own team key, DEVNET_RPC_URL overrides the RPC. The burn campaign needs no drill build: it resolves before
 * its deadline, and the team's confirmation ends the review window.
 */
import { Side } from "@brot/sdk/read";

import { check, openSession, SOL, step } from "./devnet";
import { burnMint, joinAtEstimate, openPaidBurnCampaign } from "./validator/cycle-open";
import { resolveAndConfirm, settleAndCheck } from "./validator/cycle-settle";
import { expectOk, expectRefusal, send } from "./validator/rpc";
import { burnIx } from "./validator/spl-token";

const SUPPLY = 1_000_000n;
/** The target sits exactly at the minimum distance below the supply (1%), the closest an opening allows. */
const TARGET = 990_000n;

async function main() {
  const s = await openSession(import.meta.path);
  try {
    step(`wallets (${s.cluster})`);
    const [creator, yes, no] = [
      await s.wallet("smoke-creator"),
      await s.wallet("smoke-yes"),
      await s.wallet("smoke-no"),
    ];
    const config = await s.config();
    check(
      ![creator, yes, no].some((w) => config.team.includes(w.address)),
      "the creator and the bakers are not team keys",
    );
    await s.fund(creator.address, 6n * SOL);
    await s.fund(yes.address, SOL / 10n);
    await s.fund(no.address, SOL / 10n);

    step("a burn campaign's mint: classic SPL Token, mint authority revoked");
    const { mint, holding } = await burnMint(s, creator, SUPPLY);

    step("the creator previews and opens, paying US$500 at the Pyth SOL/USD price");
    const { campaign } = await openPaidBurnCampaign(s, creator, mint, TARGET);

    step("two wallets join, YES and NO, each at its SDK estimate");
    const first = await joinAtEstimate(s, yes, campaign, mint, Side.Yes, 50_000_000n);
    await joinAtEstimate(s, no, campaign, mint, Side.No, 30_000_000n);
    expectRefusal(await send(s.rpc, yes, [await first.retry()]), "EntryTotalMismatch", "the retried entry");
    check(true, "a retried entry fails on expected_entry_total (EntryTotalMismatch): no second entry (X0.5)");

    step("the supply is burned to the target, so the fact is met");
    expectOk(await send(s.rpc, creator, [burnIx(holding, mint, creator, SUPPLY - TARGET)]), "burn");
    await resolveAndConfirm(s, campaign, mint, [yes, no]);

    step("payouts, fee, prize, close and sweep, each checked against the SDK");
    await settleAndCheck(s, campaign, creator, [yes, no]);
    console.log(`\nsmoke: the full cycle passed on ${s.cluster}`);
  } finally {
    s.stop();
  }
}

main().catch((error) => {
  console.error(`\nsmoke FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
