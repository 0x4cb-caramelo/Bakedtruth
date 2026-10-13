/**
 * Purpose: the top bar's wallet button, rendered on the server, is what the browser renders first (React #418, found
 *          after the 2026-10-13 release). The server sees no wallet and the browser almost always sees one, so the
 *          button says "Connect", enabled, until the page has hydrated; only then may a browser with no wallet say "No
 *          installed wallet found". Filter: `bun test tests/ -t "wallet render"`. Needs no SBF build.
 * Version: 0.1.0
 * Sprint:  the 2026-10-13 hydration fix
 *
 * The site's modules are imported by a computed path, as in panels-render.test.ts, so the tests' typecheck does not
 * follow them into the site's TSX, and the wallet adapter's contexts are the site's own copy.
 */
import { beforeAll, describe, expect, test } from "bun:test";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;
let html = "";

beforeAll(async () => {
  const react = await import(site("node_modules/react/index.js"));
  const server = await import(site("node_modules/react-dom/server.node.js"));
  const wallet = await import(site("node_modules/@solana/wallet-adapter-react/lib/esm/index.js"));
  const { WalletButton } = await import(site("components/wallet-button.tsx"));
  const h = react.createElement;
  html = server.renderToStaticMarkup(
    h(
      wallet.ConnectionProvider,
      { endpoint: "http://127.0.0.1:8899" },
      h(wallet.WalletProvider, { wallets: [] }, h(WalletButton)),
    ),
  );
});

describe("wallet render", () => {
  test("the server's button says Connect, enabled, as the browser's first render does", () => {
    expect(html).toContain("Connect");
    expect(html).not.toContain("No installed wallet found");
    expect(html).not.toMatch(/<button[^>]*\sdisabled/);
  });
});
