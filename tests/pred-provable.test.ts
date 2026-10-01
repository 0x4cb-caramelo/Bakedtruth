import { describe, expect, test } from "bun:test";
import { BN } from "@anchor-lang/core";
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import {
  SOL,
  balance,
  createTestClient,
  fetchMarket,
  fundedSigner,
  marketPda,
  pk,
  positionPda,
  program,
  send,
  setMint,
  setUpgradeableProgram,
  type TestClient,
} from "./helpers";

const CUTOFF = 100n;
const DEADLINE = 200n;

type Kind = { supplyAtMost: {} } | { immutable: {} } | { stakeAtLeast: { epoch: BN } };

async function createMarket(
  client: TestClient,
  sponsor: KeyPairSigner,
  opts: { id: bigint; kind: Kind; threshold: bigint; target: Address; metric: Address; stake?: bigint },
) {
  const market = await marketPda(sponsor.address, opts.id);
  const ix = await program.methods
    .createMarket({
      marketId: new BN(opts.id.toString()),
      kind: opts.kind as never,
      metricThreshold: new BN(opts.threshold.toString()),
      cutoffSlot: new BN(CUTOFF.toString()),
      deadlineSlot: new BN(DEADLINE.toString()),
      sponsorStake: new BN((opts.stake ?? SOL).toString()),
    })
    .accountsStrict({
      sponsor: pk(sponsor.address),
      market: pk(market),
      sponsorPosition: pk(await positionPda(market, sponsor.address)),
      target: pk(opts.target),
      metricAccount: pk(opts.metric),
      systemProgram: pk("11111111111111111111111111111111" as Address),
    })
    .instruction();
  await send(client, [ix], [sponsor]);
  return market;
}

async function placeBet(
  client: TestClient,
  bettor: KeyPairSigner,
  market: Address,
  metric: Address,
  side: "yes" | "no",
  amount: bigint,
) {
  const ix = await program.methods
    .placeBet(side === "yes" ? { yes: {} } : { no: {} }, new BN(amount.toString()))
    .accountsStrict({
      bettor: pk(bettor.address),
      market: pk(market),
      position: pk(await positionPda(market, bettor.address)),
      metricAccount: pk(metric),
      systemProgram: pk("11111111111111111111111111111111" as Address),
    })
    .instruction();
  return send(client, [ix], [bettor]);
}

async function resolve(client: TestClient, market: Address, metric: Address) {
  const ix = await program.methods
    .resolve()
    .accountsStrict({ market: pk(market), metricAccount: pk(metric) })
    .instruction();
  return send(client, [ix]);
}

async function claim(client: TestClient, owner: KeyPairSigner, market: Address) {
  const ix = await program.methods
    .claim()
    .accountsStrict({
      owner: pk(owner.address),
      market: pk(market),
      position: pk(await positionPda(market, owner.address)),
    })
    .instruction();
  return send(client, [ix], [owner]);
}

describe("SupplyAtMost (burn goal)", () => {
  test("goal hit: YES holder takes the sponsor's bounty", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);

    const market = await createMarket(client, sponsor, {
      id: 1n,
      kind: { supplyAtMost: {} },
      threshold: 500_000n,
      target: mint,
      metric: mint,
      stake: 2n * SOL,
    });
    await placeBet(client, doer, market, mint, "yes", SOL);

    // The doer burns half the supply (injected: the mint has no authority, so this is a real burn).
    client.svm.warpToSlot(150n);
    setMint(client, mint, 400_000n, null);

    // Anti-sniping: nobody can buy YES once the goal is visibly met.
    const sniper = await fundedSigner(client);
    await expect(placeBet(client, sniper, market, mint, "yes", SOL)).rejects.toThrow("BettingClosed");

    await resolve(client, market, mint);
    expect(fetchMarket(client, market).outcome).toEqual({ Yes: {} });

    const before = balance(client, doer.address);
    await claim(client, doer, market);
    // Whole pot (1 SOL YES + 2 SOL NO) plus the position's rent refund.
    expect(balance(client, doer.address) - before).toBeGreaterThanOrEqual(3n * SOL);
  });

  test("sniping guard: bets revert once the metric is met, even before cutoff", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const sniper = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);

    const market = await createMarket(client, sponsor, {
      id: 2n,
      kind: { supplyAtMost: {} },
      threshold: 500_000n,
      target: mint,
      metric: mint,
    });
    setMint(client, mint, 400_000n, null);

    await expect(placeBet(client, sniper, market, mint, "yes", SOL)).rejects.toThrow("MetricAlreadyMet");
  });

  test("deadline passes unmet: sponsor recovers stake plus YES money", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);

    const market = await createMarket(client, sponsor, {
      id: 3n,
      kind: { supplyAtMost: {} },
      threshold: 500_000n,
      target: mint,
      metric: mint,
    });
    await placeBet(client, doer, market, mint, "yes", SOL);

    client.svm.warpToSlot(150n);
    await expect(resolve(client, market, mint)).rejects.toThrow("NotResolvableYet");

    // Even a burn that lands after the deadline cannot flip the market to YES.
    client.svm.warpToSlot(DEADLINE + 1n);
    setMint(client, mint, 1n, null);
    await resolve(client, market, mint);
    expect(fetchMarket(client, market).outcome).toEqual({ No: {} });

    const before = balance(client, sponsor.address);
    await claim(client, sponsor, market);
    expect(balance(client, sponsor.address) - before).toBeGreaterThanOrEqual(2n * SOL);
  });

  test("rejects a mint whose authority can mint-then-burn", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, sponsor.address);

    await expect(
      createMarket(client, sponsor, {
        id: 4n,
        kind: { supplyAtMost: {} },
        threshold: 500_000n,
        target: mint,
        metric: mint,
      }),
    ).rejects.toThrow("MintAuthorityLive");
  });

  test("rejects a spoofed metric account at resolution", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    const fakeMint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);
    setMint(client, fakeMint, 0n, null);

    const market = await createMarket(client, sponsor, {
      id: 5n,
      kind: { supplyAtMost: {} },
      threshold: 500_000n,
      target: mint,
      metric: mint,
    });
    await expect(resolve(client, market, fakeMint)).rejects.toThrow("InvalidMetricAccount");
  });
});

describe("Immutable (upgrade authority revoked)", () => {
  test("revoking the authority resolves YES", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const programData = await setUpgradeableProgram(client, targetProgram, doer.address);

    const market = await createMarket(client, sponsor, {
      id: 10n,
      kind: { immutable: {} },
      threshold: 0n,
      target: targetProgram,
      metric: programData,
    });
    await placeBet(client, doer, market, programData, "yes", SOL);

    await setUpgradeableProgram(client, targetProgram, null);
    await resolve(client, market, programData);
    expect(fetchMarket(client, market).outcome).toEqual({ Yes: {} });
  });

  test("rejects a ProgramData account not derived from the target", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const otherProgram = (await generateKeyPairSigner()).address;
    await setUpgradeableProgram(client, targetProgram, sponsor.address);
    const otherData = await setUpgradeableProgram(client, otherProgram, sponsor.address);

    await expect(
      createMarket(client, sponsor, {
        id: 11n,
        kind: { immutable: {} },
        threshold: 0n,
        target: targetProgram,
        metric: otherData,
      }),
    ).rejects.toThrow("ProgramDataMismatch");
  });
});
