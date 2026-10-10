/**
 * Purpose: the web smoke's injected wallet: a Wallet Standard wallet ("E2E Test Wallet") registered in the page before
 *          its own scripts run, the way a browser extension registers itself, so the site finds it as an installed
 *          wallet and connects through "Use Installed Wallet". Its `signAndSendTransaction` hands the exact bytes the
 *          site gave it to the runner (`window.__e2eSignAndSend`), which decides what this wallet does: sign and send,
 *          refuse, send and never answer, or never answer at all. No key is in the page.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */

/** Serialised by Playwright into the page: it may use only its argument and the page's globals. */
export function injectWallet(arg: { address: string; publicKey: number[] }) {
  type Listener = (properties: { accounts: unknown[] }) => void;
  const account = {
    address: arg.address,
    publicKey: new Uint8Array(arg.publicKey),
    chains: ["solana:localnet", "solana:devnet"],
    features: ["solana:signAndSendTransaction"],
  };
  const listeners = new Set<Listener>();
  let connected = false;
  const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
  const fromBase64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  // Read at call time: the runner's binding is installed by Playwright, whatever the order of the init scripts.
  const sign = (wire: string) =>
    (window as unknown as { __e2eSignAndSend(wire: string): Promise<string> }).__e2eSignAndSend(wire);
  const wallet = {
    version: "1.0.0",
    name: "E2E Test Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiLz4=",
    chains: account.chains,
    get accounts() {
      return connected ? [account] : [];
    },
    features: {
      "standard:connect": {
        version: "1.0.0",
        connect: async () => {
          connected = true;
          listeners.forEach((listener) => listener({ accounts: [account] }));
          return { accounts: [account] };
        },
      },
      "standard:disconnect": { version: "1.0.0", disconnect: async () => void (connected = false) },
      "standard:events": {
        version: "1.0.0",
        on: (_event: string, listener: Listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      },
      "solana:signAndSendTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: ["legacy", 0],
        signAndSendTransaction: async (...inputs: { transaction: Uint8Array }[]) =>
          Promise.all(
            inputs.map(async (input) => ({ signature: fromBase64(await sign(toBase64(input.transaction))) })),
          ),
      },
    },
  };
  const register = ({ register }: { register(wallet: unknown): void }) => register(wallet);
  window.addEventListener("wallet-standard:app-ready", (event) => register((event as CustomEvent).detail));
  window.dispatchEvent(new CustomEvent("wallet-standard:register-wallet", { detail: register }));
}
