/**
 * Purpose: the reserve path end to end (TP §3.4.5; TP v0.0.1 Q2, answered b): a creator share that would leave the
 *          creator's empty wallet below the rent-exempt minimum stays in the vault, with no event; the SDK's claim
 *          (`prepareClaim`, A-3) refuses while the wallet cannot pay the fee and stay at the minimum, then prepares the
 *          one transaction that pays the reserve to the creator the program stored; a second claim pays nothing.
 *          Filter: `bun test tests/ -t "credit to an empty wallet below rent is reserved"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, getBase64EncodedWireTransaction, lamports, signTransaction, type Address } from "@solana/kit";

import {
  BROT_ERROR_CODES,
  creatorShareStatus,
  decodeCampaign,
  decodeTransactionEvents,
  Side,
  type RpcTransaction,
} from "@brot/sdk/read";
import { buildSettleCreatorShare, buildSettleEntry, claimFloor, prepareClaim } from "@brot/sdk/tx";

import { openingWorld, type OpeningWorld } from "../brot/opening";
import { balance, fundedWallet } from "../brot/setup";
import { landVia, sendVia } from "../site/cycle";
import { runCycle, type Cycle } from "../site/cycle-run";
import { rawOf } from "../site/support";

let run: Cycle | null = null;
afterEach(() => run?.chain.close());

const MIN_ENTRY = 10_000_000n;

function setLamports(w: OpeningWorld, at: Address, amount: bigint) {
  w.client.svm.setAccount({
    address: at,
    data: new Uint8Array(0),
    executable: false,
    lamports: lamports(amount),
    programAddress: "11111111111111111111111111111111" as Address,
    space: 0n,
  });
}

describe("credit to an empty wallet below rent is reserved", () => {
  test("the share stays in the vault, the claim waits for a wallet that can take it, then pays once", async () => {
    const w = await openingWorld();
    run = await runCycle(
      w,
      ([ana, bruno]) => [
        { who: ana, side: Side.Yes, amount: MIN_ENTRY },
        { who: bruno, side: Side.No, amount: MIN_ENTRY },
      ],
      { how: "no", stopAt: "settling", emptyCreator: true },
    );
    const { chain, campaign, keeper } = run;
    const rpc = createSolanaRpc(chain.url);
    for (const b of run.placed)
      await landVia(chain, keeper, [await buildSettleEntry({ campaign, baker: b.who.address })]);
    const share = decodeCampaign(rawOf(w, campaign)).creatorShare;
    const rentMinimum = w.client.svm.minimumBalanceForRentExemption(0n);
    expect(share).toBeGreaterThan(0n);
    expect(share).toBeLessThan(rentMinimum);

    // The keeper's attempt lands, pays nothing and emits nothing: the share is reserved.
    const sig = await landVia(chain, keeper, [await buildSettleCreatorShare({ campaign, creator: w.creator.address })]);
    const tx = await rpc.getTransaction(sig as never, { encoding: "json", maxSupportedTransactionVersion: 0 }).send();
    expect(decodeTransactionEvents(tx as unknown as RpcTransaction).map((e) => e.name)).toEqual([]);
    expect(balance(w, w.creator.address)).toBe(0n);
    expect(creatorShareStatus(decodeCampaign(rawOf(w, campaign)))).toEqual({ status: "reserved", amount: share });

    // Another wallet cannot claim it; an empty wallet cannot yet.
    const other = await fundedWallet(w);
    expect(await prepareClaim({ rpc, creator: other, campaign })).toMatchObject({ ok: false, refusal: "WrongCreator" });
    expect(await prepareClaim({ rpc, creator: w.creator, campaign })).toMatchObject({
      ok: false,
      refusal: "WalletBelowMinimum",
      reserved: share,
    });

    // One lamport short of the floor: the SDK refuses, and so does the cluster when sent anyway.
    const fee = 5_000n;
    const floor = claimFloor(rentMinimum, fee);
    setLamports(w, w.creator.address, floor - 1n);
    expect(await prepareClaim({ rpc, creator: w.creator, campaign })).toMatchObject({ refusal: "WalletBelowMinimum" });
    const short = await sendVia(chain, w.creator, [
      await buildSettleCreatorShare({ campaign, creator: w.creator.address }),
    ]);
    expect(short.err).not.toBeNull();

    // At the floor: prepared, signed by the creator, and paid to the creator the program stored. A new blockhash first,
    // as a cluster moves on: the same bytes as the short attempt would be refused as already processed.
    w.client.svm.expireBlockhash();
    setLamports(w, w.creator.address, floor);
    const prepared = await prepareClaim({ rpc, creator: w.creator, campaign });
    if (!prepared.ok)
      throw new Error(`not prepared: ${JSON.stringify(prepared, (_, v) => (typeof v === "bigint" ? `${v}` : v))}`);
    expect(prepared.networkFee).toBe(fee);
    expect(prepared.summary.trusted).toBe(true);
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["CreatorShareSettled"]);
    const signed = await signTransaction([w.creator.keyPair], prepared.transaction);
    const claimed = await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" }).send();
    const landed = await rpc.getTransaction(claimed, { encoding: "json", maxSupportedTransactionVersion: 0 }).send();
    const events = decodeTransactionEvents(landed as unknown as RpcTransaction);
    expect(events.map((e) => e.name)).toEqual(["CreatorShareSettled"]);
    expect(events[0].data).toMatchObject({ creator: w.creator.address, amount: share });
    expect(balance(w, w.creator.address)).toBe(floor - fee + share);
    expect(creatorShareStatus(decodeCampaign(rawOf(w, campaign)))).toEqual({ status: "paid", amount: share });

    // Nothing left to claim: the SDK says so, and the program refuses a second payment.
    expect(await prepareClaim({ rpc, creator: w.creator, campaign })).toMatchObject({ refusal: "NothingReserved" });
    w.client.svm.expireBlockhash();
    const again = await sendVia(chain, keeper, [
      await buildSettleCreatorShare({ campaign, creator: w.creator.address }),
    ]);
    // Kit parses every integer of an RPC answer as a bigint.
    expect(again.err).toEqual({ InstructionError: [0n, { Custom: BigInt(BROT_ERROR_CODES.AlreadySettled) }] });
  });

  test("a campaign not yet finalized has nothing to claim", async () => {
    const w = await openingWorld();
    run = await runCycle(w, ([ana]) => [{ who: ana, side: Side.Yes, amount: MIN_ENTRY }], {
      how: "no",
      stopAt: "review",
    });
    const rpc = createSolanaRpc(run.chain.url);
    expect(await prepareClaim({ rpc, creator: w.creator, campaign: run.campaign })).toMatchObject({
      ok: false,
      refusal: "NotFinalized",
    });
  });
});
