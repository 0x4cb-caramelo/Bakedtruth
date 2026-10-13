/**
 * Purpose: the SDK's event table and addresses against the program: each event's discriminator and size
 *          as events.rs and events/*.rs declare them, the event decoder's refusals of near misses, every
 *          PDA against the test kit's own derivation, and the account decoders' loader checks (owner,
 *          size, tag, layout version). Needs no binary.
 * Version: 0.1.1
 * Sprint:  05 (SDK); the referral link's and the sealed fee's PDAs (scaffold of Sprints 14–15, 2026-10-13)
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { generateKeyPairSigner } from "@solana/kit";

import * as R from "@brot/sdk/read";

import * as P from "../brot/program";
import { sampleBytes } from "../brot/idl";

const EVENTS_DIR = "programs/brot-markets/src/events";
const eventSources = [
  "programs/brot-markets/src/events.rs",
  ...readdirSync(EVENTS_DIR).map((f) => `${EVENTS_DIR}/${f}`),
]
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

describe("sdk events and addresses match the program", () => {
  test("every event's discriminator and size, from the Rust source", () => {
    const discriminators = [...eventSources.matchAll(/impl Event for (\w+) \{\s*const DISCRIMINATOR: u8 = (\d+);/g)];
    const sizes = Object.fromEntries(
      [...eventSources.matchAll(/zero_copy!\(([^)]*)\)/g)].flatMap(([, body]) =>
        [...body.matchAll(/(\w+) = (\d+)/g)].map(([, name, size]) => [name, Number(size)]),
      ),
    );
    const rust = discriminators.map(([, name, d]) => [name, Number(d), sizes[name]]).sort((a, b) => +a[1] - +b[1]);
    expect(R.EVENTS.map((e) => [e.name, e.discriminator, e.decoder.fixedSize]) as unknown[]).toEqual(rust);
    expect(rust.map(([, d]) => d)).toEqual(rust.map((_, i) => i));
  });

  test("an event's bytes decode only when exact: tag, discriminator and size", () => {
    for (const event of R.EVENTS) {
      const payload = sampleBytes(event.name);
      const data = Uint8Array.of(R.EVENT_IX_TAG, event.discriminator, ...payload);
      expect(R.decodeEventData(data)?.name).toBe(event.name);
      expect(R.decodeEventData(data.slice(0, -1))).toBeNull();
      expect(R.decodeEventData(Uint8Array.of(...data, 0))).toBeNull();
      expect(R.decodeEventData(Uint8Array.of(0xfe, ...data.slice(1)))).toBeNull();
    }
    expect(R.decodeEventData(Uint8Array.of(R.EVENT_IX_TAG, R.EVENTS.length))).toBeNull();
    expect(R.decodeEventData(Uint8Array.of(R.EVENT_IX_TAG))).toBeNull();
  });

  test("every PDA as the test kit derives it, and the event authority's constant and bump", async () => {
    const [campaign, baker] = [await P.campaignPda(42n), (await generateKeyPairSigner()).address];
    expect([
      await R.configAddress(),
      await R.feeVaultAddress(),
      await R.campaignAddress(42n),
      await R.vaultAddress(campaign),
      await R.entryAddress(campaign, baker),
      await R.joinAddress(campaign, baker, 3),
      await R.referralLinkAddress(baker),
      await R.sealedFeeAddress(campaign, baker),
      await R.programDataAddress(),
      await R.sponsoredPriceAddress(P.SOL_USD_FEED_ID),
      await R.sponsoredPriceAddress(R.SOL_USD_FEED_HEX),
    ]).toEqual([
      await P.configPda(),
      await P.feeVaultPda(),
      campaign,
      await P.vaultPda(campaign),
      await P.entryPda(campaign, baker),
      await P.joinPda(campaign, baker, 3),
      await P.referralLinkPda(baker),
      await P.sealedFeePda(campaign, baker),
      await P.programDataPda(),
      P.SOL_USD_ACCOUNT,
      R.SOL_USD_ACCOUNT,
    ]);
    expect(await R.findEventAuthorityPda()).toEqual([R.EVENT_AUTHORITY, R.EVENT_AUTHORITY_BUMP] as never);
  });

  test("account decoders refuse what the program's loader refuses, in its order", () => {
    const campaign = sampleBytes("Campaign");
    campaign.set([R.ACCOUNT_TAG.campaign, R.LAYOUT_VERSION], 0);
    const ok = { owner: R.PROGRAM_ID, data: campaign };
    expect(R.decodeCampaign(ok).id).toBeTypeOf("bigint");
    const refused = (account: R.RawAccount) => {
      try {
        R.decodeCampaign(account);
        return "decoded";
      } catch (error) {
        return (error as R.AccountRefused).problem;
      }
    };
    expect(refused({ ...ok, owner: R.SYSTEM_PROGRAM_ID })).toBe("WrongOwner");
    expect(refused({ ...ok, data: campaign.slice(0, -1) })).toBe("WrongLength");
    expect(refused({ ...ok, data: Uint8Array.of(R.ACCOUNT_TAG.entry, ...campaign.slice(1)) })).toBe("WrongTag");
    expect(refused({ ...ok, data: Uint8Array.of(campaign[0], 2, ...campaign.slice(2)) })).toBe("WrongLayoutVersion");
    expect(Object.entries(R.ACCOUNT_LEN).filter(([k]) => !k.endsWith("ault"))).toEqual([
      ["globalConfig", 400],
      ["campaign", 512],
      ["entry", 116],
      ["join", 96],
    ]);
  });
});
