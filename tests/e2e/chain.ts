/**
 * Purpose: the web smoke's chain (Sprint 11, `bun run e2e`): the program in LiteSVM (CI's binary in target/deploy) with
 *          the founder's config, a team key and a paying creator, behind the site tests' recording JSON-RPC endpoint
 *          (with CORS, so the browser can call it); a stand-in for the read API's health (entries taken, K-11); and a
 *          loopback control endpoint (control.ts) for the Playwright runner. Started by tests/e2e/run.ts.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 *
 * Why LiteSVM and not Surfpool: the same program binary runs here with the captured Pyth accounts already fresh, in
 * process, with no network namespace; the smoke checks the site's wiring, and the program's behaviour on a real
 * validator is Sprint 05's devnet cycle. Ports (loopback only): RPC 4241, health 4242, control 4243.
 */
import { openingWorld } from "../brot/opening";
import { fundedWallet } from "../brot/setup";
import { startFakeChain } from "../site/fake-chain";
import { startControl } from "./control";

export const PORTS = { site: 4240, rpc: 4241, api: 4242, control: 4243 } as const;

const w = await openingWorld();
const chain = startFakeChain(w, { port: PORTS.rpc, cors: true });
const wallet = await fundedWallet(w, 100n);
let campaigns = 0;

const health = Bun.serve({
  hostname: "127.0.0.1",
  port: PORTS.api,
  fetch(request) {
    const headers = { "content-type": "application/json", "access-control-allow-origin": "*" };
    const path = new URL(request.url).pathname;
    // "My entries" asks which campaigns exist; an empty list makes it read the wallet's history alone (Sprint 12).
    if (path === "/api/v1/campaigns") {
      const chainTime = w.client.svm.getClock().unixTimestamp.toString();
      const list = { campaigns: [], total: 0, limit: 100, offset: 0, as_of_slot: "0", chain_time: chainTime };
      return new Response(JSON.stringify(list), { headers });
    }
    if (path !== "/api/v1/health") return new Response("{}", { status: 404, headers });
    const body = {
      status: "ok",
      cluster: "local",
      schema_version: 1,
      as_of_slot: w.client.svm.getClock().slot.toString(),
      taken_at: new Date().toISOString(),
      campaigns_total: campaigns,
      last_refresh_error: null,
    };
    return new Response(JSON.stringify(body), { headers });
  },
});

const control = startControl({ w, chain, wallet, port: PORTS.control, opened: () => campaigns++ });

console.log(JSON.stringify({ ready: true, rpc: chain.url, wallet: wallet.address, ports: PORTS }));

const stop = () => {
  control.stop(true);
  health.stop(true);
  chain.close();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
