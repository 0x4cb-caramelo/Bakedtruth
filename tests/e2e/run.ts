/**
 * Purpose: `bun run e2e`, the web smoke on this machine (Sprint 11): the chain process (tests/e2e/chain.ts: the program
 *          in LiteSVM, CI's binary in target/deploy), then the site built against it and served on 127.0.0.1:4240,
 *          then Playwright 1.63.0 at desktop width and 412 px. Every port is on loopback; nothing reaches a cluster or
 *          the server. It stops what it started, whatever the result. Extra arguments go to Playwright.
 * Version: 0.2.0 (Sprint 13: E2E_RUNTIME=bun, for X2.4)
 * Sprint:  11 (site: campaign page and entry); 13
 *
 * The site's build in app/.next is left built for the local chain: build it again for devnet afterwards. E2E_SKIP_BUILD=1
 * reuses a build made for the smoke. E2E_RUNTIME=bun builds and serves the site under Bun itself (`bun --bun next`), the
 * runtime D-p prefers for brot-web; by default `next start` runs under Node, as its own script says.
 */
import { spawn, type Subprocess } from "bun";

const SITE = "http://127.0.0.1:4240";
const env = {
  ...process.env,
  NEXT_PUBLIC_RPC_URL: "http://127.0.0.1:4241",
  NEXT_PUBLIC_API_URL: "http://127.0.0.1:4242",
  NEXT_PUBLIC_CLUSTER: "devnet",
  NEXT_TELEMETRY_DISABLED: "1",
};
const io = { stdout: "inherit", stderr: "inherit" } as const;
const onBun = process.env.E2E_RUNTIME === "bun";
const NEXT = "node_modules/.bin/next";
const started: Subprocess[] = [];

async function waitFor(url: string, what: string, ms = 90_000): Promise<void> {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const ok = await fetch(url).then(
      (r) => r.ok,
      () => false,
    );
    if (ok) return;
    await Bun.sleep(500);
  }
  throw new Error(`${what} did not answer at ${url} within ${ms / 1000} s`);
}

let code = 1;
try {
  started.push(spawn(["bun", "tests/e2e/chain.ts"], io));
  await waitFor("http://127.0.0.1:4242/api/v1/health", "the chain");
  if (!process.env.E2E_SKIP_BUILD) {
    const build = spawn(onBun ? ["bun", "--bun", NEXT, "build"] : ["bun", "run", "build"], { cwd: "app", env, ...io });
    if ((await build.exited) !== 0) throw new Error("the site did not build");
  }
  const serve = [NEXT, "start", "-p", "4240", "-H", "127.0.0.1"];
  started.push(spawn(onBun ? ["bun", "--bun", ...serve] : serve, { cwd: "app", env, ...io }));
  console.log(`e2e: the site runs under ${onBun ? `Bun ${Bun.version}` : "Node"}`);
  await waitFor(SITE, "the site");
  const playwright = spawn(
    ["node_modules/.bin/playwright", "test", "-c", "tests/e2e/playwright.config.ts", ...process.argv.slice(2)],
    io,
  );
  code = await playwright.exited;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  for (const child of started) child.kill();
  console.log("e2e: the site in app/.next is built for the local chain; run `cd app && bun run build` for devnet.");
}
process.exit(code);
