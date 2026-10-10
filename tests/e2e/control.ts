/**
 * Purpose: the web smoke's control endpoint (loopback, test only): what the Playwright runner asks of the chain. Sign
 *          the bytes the injected wallet was handed with the test wallet's key and send them (its
 *          `signAndSendTransaction`); open a campaign; an entry by another baker or by the test wallet itself; the
 *          team's pause and the admin's resume; a price of a given age; the clock; the block height; a wallet's
 *          balance; the SDK's estimate for an entry (to compare with the screen); and the RPC methods seen so far.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import {
  createSolanaRpc,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getTransactionDecoder,
  lamports,
  signTransaction,
  signTransactionMessageWithSigners,
  type Address,
  type KeyPairSigner,
} from "@solana/kit";

import {
  checkJoin,
  configAddress,
  decodeCampaign,
  decodeEntry,
  decodeGlobalConfig,
  entryAddress,
  entryTotal,
  Side,
} from "@brot/sdk/read";
import { buildJoinCampaign, messageFor } from "@brot/sdk/tx";

import { openedCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import type { OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, fundedWallet, send, setPriceAccount, setTime } from "../brot/setup";
import type { FakeChain } from "../site/fake-chain";
import { chainOf, rawOf } from "../site/support";

type Body = Record<string, string>;

export function startControl(a: {
  w: OpeningWorld;
  chain: FakeChain;
  wallet: KeyPairSigner;
  port: number;
  opened: () => void;
}) {
  const { w, chain, wallet } = a;
  const rpc = createSolanaRpc(chain.url);
  const entryOf = async (campaign: Address, baker: Address) => {
    const account = w.client.svm.getAccount(await entryAddress(campaign, baker));
    if (!account.exists || account.data.length === 0) return null;
    return decodeEntry({ owner: account.programAddress, data: new Uint8Array(account.data) });
  };
  const routes: Record<string, (body: Body) => Promise<unknown> | unknown> = {
    "/wallet": () => ({ address: wallet.address }),
    "/sign-and-send": async ({ wire }) => {
      const tx = getTransactionDecoder().decode(getBase64Encoder().encode(wire));
      const signed = await signTransaction([wallet.keyPair], tx);
      const wired = getBase64EncodedWireTransaction(signed);
      return { signature: await rpc.sendTransaction(wired, { encoding: "base64" }).send() };
    },
    "/campaign": async () => {
      const { args, campaign } = await openedCampaign(w, w.creator);
      a.opened();
      const closes = decodeCampaign(rawOf(w, campaign)).entriesCloseAt.toString();
      return { id: args.id.toString(), address: campaign, closes };
    },
    "/join": async ({ campaign, side, amount, as }) => {
      // Sent through the same RPC as the page's own, so the blockhash a page prepared with stays valid.
      const baker = as === "wallet" ? wallet : await fundedWallet(w, 1_000n);
      const entry = await entryOf(campaign as Address, baker.address);
      const ix = await buildJoinCampaign({
        baker,
        campaign: campaign as Address,
        metricAccount: decodeCampaign(rawOf(w, campaign as Address)).metricAccount,
        side: side === "yes" ? Side.Yes : Side.No,
        amount: BigInt(amount),
        minReturnBps: 0,
        expectedEntryTotal: entryTotal(entry),
        joinIndex: entry?.joinCount ?? 0,
      });
      const signed = await signTransactionMessageWithSigners(await messageFor(rpc, baker, ix));
      const signature = await rpc
        .sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" })
        .send();
      const { value } = await rpc.getSignatureStatuses([signature]).send();
      if (value[0]?.err)
        throw new Error(
          `the join failed: ${JSON.stringify(value[0].err, (_, v) => (typeof v === "bigint" ? `${v}` : v))}`,
        );
      return { ok: true };
    },
    "/pause": async () => (expectOk(await send(w, [await I.pauseEntriesIx(w.team)])), { ok: true }),
    "/resume": async () => (expectOk(await send(w, [await I.resumeEntriesIx(w.admin)])), { ok: true }),
    "/price": ({ age }) => {
      const publishTime = w.client.svm.getClock().unixTimestamp - BigInt(age);
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime });
      return { ok: true };
    },
    "/clock": ({ unix }) => (setTime(w.client, BigInt(unix)), { ok: true }),
    "/block-height": ({ height }) => (chain.setBlockHeight(BigInt(height)), { ok: true }),
    "/lamports": ({ address, amount }) => {
      const at = address as Address;
      const now = w.client.svm.getAccount(at);
      const data = new Uint8Array(now.exists ? now.data : []);
      const programAddress = now.exists ? now.programAddress : P.SYSTEM_PROGRAM_ID;
      w.client.svm.setAccount({
        address: at,
        data,
        executable: false,
        lamports: lamports(BigInt(amount)),
        programAddress,
        space: BigInt(data.length),
      });
      return { ok: true };
    },
    "/estimate": async ({ campaign, side, amount, baker }) => {
      const c = decodeCampaign(rawOf(w, campaign as Address));
      const check = checkJoin({
        campaign: c,
        config: decodeGlobalConfig(rawOf(w, await configAddress())),
        entry: await entryOf(campaign as Address, baker as Address),
        metric: rawOf(w, c.metricAccount),
        chain: chainOf(w),
        side: side === "yes" ? Side.Yes : Side.No,
        amount: BigInt(amount),
      });
      return check.ok ? { bps: check.estimateBps.toString() } : { refusal: check.refusal.errorName };
    },
    "/entry": async ({ campaign, baker }) => {
      const entry = await entryOf(campaign as Address, baker as Address);
      return { yes: (entry?.amountYes ?? 0n).toString(), no: (entry?.amountNo ?? 0n).toString() };
    },
    "/methods": () => ({ methods: chain.methods }),
    "/now": () => ({ unix: w.client.svm.getClock().unixTimestamp.toString() }),
  };
  return Bun.serve({
    hostname: "127.0.0.1",
    port: a.port,
    async fetch(request) {
      const route = routes[new URL(request.url).pathname];
      if (!route) return Response.json({ error: "no such route" }, { status: 404 });
      const body = request.method === "POST" ? ((await request.json().catch(() => ({}))) as Body) : {};
      try {
        return Response.json(await route(body));
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
      }
    },
  });
}
