/**
 * Purpose: open one short-lived BTC/USD price campaign on devnet for the keeper's real-resolve test (Sprint 06):
 *          target 1.2% above the sponsored price (past its confidence band, at the 1% minimum distance), two-day
 *          deadline. Free only for a team key (TEAM_KEYPAIR); any other wallet pays the opening fee in SOL.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), the real-resolve test
 *
 * Run: TEAM_KEYPAIR=/path/team.json bun scripts/devnet-open-test.ts -- --cluster devnet
 */
import { DEVNET_FEEDS, ReaderKind, campaignAddress, readPriceUpdate, sponsoredPriceAddress } from "@brot/sdk/read";
import { buildOpenCampaign, randomCampaignId } from "@brot/sdk/tx";

import { check, openSession, step } from "./devnet";
import { account, clock, expectOk, send } from "./validator/rpc";

const DAY = 86_400n;

async function main() {
  const s = await openSession(import.meta.path);
  try {
    await s.freshPrices();
    const hex = DEVNET_FEEDS.find(([, name]) => name === "Crypto.BTC/USD")![0];
    const found = (await account(s.rpc, await sponsoredPriceAddress(hex)))!;
    const reading = readPriceUpdate(found.owner, found.data, hex);
    const target = ((reading.price + reading.conf) * 1012n) / 1000n;
    const now = (await clock(s.rpc)).unixTimestamp;
    step(`BTC/USD above ${target} (now ${reading.price}e${reading.exponent}, conf ${reading.conf})`);
    const args = {
      kind: ReaderKind.PriceTouch,
      feedId: hex,
      target,
      deadlineAt: now + 2n * DAY,
      id: randomCampaignId(),
      openingUsd: 0n,
      maxLamports: 0n,
      expectedParamsVersion: (await s.config()).paramsVersion,
    };
    const ix = await buildOpenCampaign({ creator: s.team, args });
    const sent = expectOk(await send(s.rpc, s.team, [ix]), "open the test campaign");
    check(sent.events[0]?.name === "CampaignOpened", `campaign ${args.id} at ${await campaignAddress(args.id)}`);
  } finally {
    s.stop?.();
  }
}

await main();
