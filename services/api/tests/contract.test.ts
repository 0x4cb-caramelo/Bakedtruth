/**
 * Purpose: the read API's contract (Sprint 08 DoD "/api/v1": zod DTOs with contract tests), no cluster: every
 *          /api/v1 answer parses with its schema in @brot/sdk/schemas (read-api.ts), errors included; health's
 *          `entries_allowed` is true only while the snapshot is fresh, the program has not halted entries and the
 *          operator's switch is on, and false in every other case (fail closed); `program_last_deploy_slot` is the
 *          ProgramData slot as a string, or null; the snapshot reads both, and a failure of either leaves it unknown
 *          without failing the snapshot.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getBase64Decoder } from "@solana/kit";
import {
  BPF_LOADER_UPGRADEABLE_ID,
  CLOCK_SYSVAR_ID,
  configAddress,
  Outcome,
  programDataAddress,
  PROGRAM_ID,
  ReaderKind,
  Status,
  type Campaign,
  type SolanaRpc,
} from "@brot/sdk/read";
import {
  ApiErrorSchema,
  CampaignDetailSchema,
  CampaignListSchema,
  LeaderboardSchema,
  NamesSchema,
  PriceSchema,
  ReadApiHealthSchema,
} from "@brot/sdk/schemas";

import { createNames } from "../src/names";
import { createPrice } from "../src/price";
import { createHandler, type RouteOptions } from "../src/routes";
import { takeSnapshot, type Snapshot } from "../src/snapshot";
import type { Store } from "../src/store";
import { call, EVENTS, history } from "./board-kit";

const AT = (c: string | number) => `${"1".repeat(31)}${c}`;
const CHAIN = { slot: 500n, epoch: 7n, unixTimestamp: 1_800_000_000n };
const campaign = (n: number): Campaign =>
  ({
    ...{ id: BigInt(n), kind: ReaderKind.PriceTouch, status: Status.Open, outcome: Outcome.Unresolved, direction: 0 },
    ...{ creator: AT("C"), creatorIsTeam: false, poolYes: 1_000_000n, poolNo: 0n, prizeLamports: 4_500_000_000n },
    ...{
      entriesCloseAt: 1_800_000_100n,
      deadlineAt: 1_800_500_000n,
      resolvedAt: 0n,
      target: -5n,
      metricAccount: AT(9),
    },
    ...{ feedId: new Uint8Array(32).fill(0xef), priceExponent: -8, opensAt: 1_799_000_000n, entriesOpen: 1 },
    ...{ feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: 100 },
  }) as unknown as Campaign;
const view = { state: "Open", closedBecause: null, contested: false, reviewEndsAt: null, windowEnded: false };
const snap = (more: Partial<Snapshot> = {}): Snapshot => ({
  ...{ takenAt: "2026-10-13T06:00:00.000Z", asOfSlot: 500n, chain: CHAIN },
  rows: [2, 3].map((n) => ({ address: AT(n), campaign: campaign(n), view }) as unknown as Snapshot["rows"][0]),
  ...more,
});
const storeOf = (s: Snapshot | null, error: string | null = null): Store => ({
  current: () => s,
  lastError: () => error,
  refresh: async () => {},
});
const get = async (store: Store, path: string, options: Partial<RouteOptions> = {}) => {
  const res = await createHandler(store, { corsOrigin: "*", cluster: "devnet", ...options })(
    new Request(`http://api.test${path}`),
  );
  return { status: res.status, body: await res.json() };
};
const health = async (store: Store, options: Partial<RouteOptions> = {}) =>
  ReadApiHealthSchema.parse((await get(store, "/api/v1/health", options)).body);

describe("health: entries_allowed and the deploy slot", () => {
  test("true only when fresh, not halted and switched on; false in every other case", async () => {
    const live = snap({ entriesHalted: false, deploySlot: 452_000_123n });
    expect(await health(storeOf(live))).toMatchObject({ entries_allowed: true, program_last_deploy_slot: "452000123" });
    expect((await health(storeOf(null))).entries_allowed).toBe(false); // starting (503)
    expect((await health(storeOf(live, "TypeError"))).entries_allowed).toBe(false); // stale
    expect((await health(storeOf(snap({ entriesHalted: true })))).entries_allowed).toBe(false); // halted on-chain
    expect(await health(storeOf(snap()))).toMatchObject({ entries_allowed: false, program_last_deploy_slot: null });
    expect((await health(storeOf(live), { entriesSwitch: false })).entries_allowed).toBe(false); // the switch
  });

  test("the snapshot reads the operating level and the deploy slot; either failing is unknown, never fatal", async () => {
    const [config, programData] = [String(await configAddress()), String(await programDataAddress())];
    const configBytes = (level: number) => {
      const data = new Uint8Array(400);
      [data[0], data[1], data[4]] = [1, 1, level]; // tag, layout version, operating level
      return data;
    };
    const deployBytes = new Uint8Array(45);
    new DataView(deployBytes.buffer).setUint32(0, 3, true);
    new DataView(deployBytes.buffer).setBigUint64(4, 452_000_123n, true);
    const clock = new Uint8Array(40);
    new DataView(clock.buffer).setBigUint64(0, 500n, true);
    new DataView(clock.buffer).setBigInt64(32, 1_800_000_000n, true);
    const fakeRpc = (accounts: Record<string, { owner: string; data: Uint8Array } | Error>) =>
      ({
        getAccountInfo: (at: string) => ({
          send: async () => {
            const a = accounts[at];
            if (a instanceof Error) throw a;
            return { value: a ? { owner: a.owner, data: [getBase64Decoder().decode(a.data), "base64"] } : null };
          },
        }),
        getProgramAccounts: () => ({ send: async () => [] }),
      }) as unknown as SolanaRpc;
    const sysvar = { owner: "Sysvar1111111111111111111111111111111111111", data: clock };
    const both = {
      [CLOCK_SYSVAR_ID]: sysvar,
      [config]: { owner: PROGRAM_ID, data: configBytes(1) },
      [programData]: { owner: BPF_LOADER_UPGRADEABLE_ID, data: deployBytes },
    };
    expect(await takeSnapshot(fakeRpc(both))).toMatchObject({ entriesHalted: true, deploySlot: 452_000_123n });
    const normal = { ...both, [config]: { owner: PROGRAM_ID, data: configBytes(0) } };
    expect((await takeSnapshot(fakeRpc(normal))).entriesHalted).toBe(false);
    const broken = {
      [CLOCK_SYSVAR_ID]: sysvar,
      [config]: { owner: AT(9), data: configBytes(0) },
      [programData]: new Error("429"),
    };
    expect(await takeSnapshot(fakeRpc(broken))).toMatchObject({ entriesHalted: null, deploySlot: null, rows: [] });
  });
});

describe("every /api/v1 answer parses with its schema", () => {
  test("health, the list, one campaign, and their errors", async () => {
    const store = storeOf(snap({ entriesHalted: false, deploySlot: 7n }));
    ReadApiHealthSchema.parse((await get(storeOf(null), "/api/v1/health")).body);
    const list = CampaignListSchema.parse((await get(store, "/api/v1/campaigns?state=active&limit=1")).body);
    expect([list.total, list.campaigns[0].target, list.campaigns[0].feed_id]).toEqual([2, "-5", "ef".repeat(32)]);
    expect(CampaignDetailSchema.parse((await get(store, `/api/v1/campaigns/${AT(3)}`)).body).campaign.id).toBe("3");
    for (const [path, status, s] of [
      ["/api/v1/campaigns?sort=id", 400, store],
      [`/api/v1/campaigns/${AT(9)}`, 404, store],
      ["/api/v1/campaigns", 503, storeOf(null)],
      ["/api/v1/leaderboard", 503, store],
      ["/api/v1/names", 503, store],
      ["/api/v1/price", 503, store],
    ] as const) {
      const answer = await get(s, path);
      expect([path, answer.status]).toEqual([path, status]);
      ApiErrorSchema.parse(answer.body);
    }
  });

  test("the leaderboard, the names and the price", async () => {
    LeaderboardSchema.parse((await call(history(EVENTS), "/api/v1/leaderboard?limit=2")).body);
    const dir = mkdtempSync(join(tmpdir(), "brot-api-contract-"));
    try {
      const file = join(dir, "names.json");
      writeFileSync(file, JSON.stringify([{ address: AT(9), kind: "curve", name: "$TEST" }]));
      const names = await createNames(file);
      const now = () => 1_800_000_000n;
      const price = createPrice({ pyth: async () => ({ usd: "142.50", publishedAt: now() - 5n }), now });
      await price.refresh();
      const store = storeOf(snap());
      expect(NamesSchema.parse((await get(store, "/api/v1/names", { names })).body).names).toHaveLength(1);
      expect(PriceSchema.parse((await get(store, "/api/v1/price", { price, now })).body).price.usd).toBe("142.50");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
