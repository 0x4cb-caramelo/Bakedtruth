/**
 * Purpose: the web smoke's control routes for Sprint 19 ("open a campaign"): make the smoke's test wallet a team key, or
 *          take that away again (the admin's `admin_set_team`, keeping the world's own team key); set Pyth's SOL/USD
 *          price to a given age (a paid opening waits while it is stale); and read the campaign the box opened at an
 *          id, with what the program stored and whether it equals the quote's formula at the price it read
 *          (`ceil(opening_usd × 10^(9 − e) ÷ p)`, split as prize plus opening fee; I14).
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import type { KeyPairSigner } from "@solana/kit";

import { campaignAddress, decodeCampaign, openingPaidLamports, splitOpening } from "@brot/sdk/read";
import { buildSetTeam } from "@brot/sdk/tx";

import type { OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, send, setPriceAccount } from "../brot/setup";
import { rawOf } from "../site/support";

type Body = Record<string, string>;

export function openRoutes(a: { w: OpeningWorld; wallet: KeyPairSigner }) {
  const { w, wallet } = a;
  return {
    "/team-wallet": async ({ on }: Body) => {
      const team = on === "1" ? [w.team.address, wallet.address] : [w.team.address];
      expectOk(await send(w, [await buildSetTeam({ admin: w.admin, team })]));
      return { ok: true };
    },
    "/sol-price": ({ age }: Body) => {
      const publishTime = w.client.svm.getClock().unixTimestamp - BigInt(age);
      setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime });
      return { ok: true };
    },
    "/opened": async ({ id }: Body) => {
      const c = decodeCampaign(rawOf(w, await campaignAddress(BigInt(id))));
      const formula =
        c.openingUsd === 0n ? 0n : openingPaidLamports(c.openingUsd, c.openingPrice, c.openingPriceExponent);
      const split = splitOpening(c.openingPaidLamports, 9_000);
      return {
        creator: c.creator,
        creatorIsTeam: c.creatorIsTeam,
        paid: c.openingPaidLamports.toString(),
        prize: c.prizeLamports.toString(),
        fee: c.openingFeeLamports.toString(),
        creatorShareBps: c.creatorShareBps,
        matchesFormula: formula === c.openingPaidLamports,
        splitHolds: split.prize === c.prizeLamports && split.fee === c.openingFeeLamports,
      };
    },
  };
}
