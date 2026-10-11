/**
 * Purpose: the methods brot-rpc relays and the arguments each may carry (docs/technical/relay-allowlist.md, the trace of
 *          Sprints 11 to 19; TP §3.5, §6): eleven methods, each with its credit weight, the options its config object
 *          may hold, the bounds of its positional arguments, and its kind (an account read, the rent table, a
 *          transaction). Anything else, every subscription and getProgramAccounts included, is refused before the
 *          upstream sees it. The weights are a working guess until each provider's are measured (TP C32) [AC]. Pure.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */

export type MethodKind = "account" | "rent" | "transaction" | "plain";
export type MethodSpec = {
  weight: number;
  kind: MethodKind;
  /** The keys its config object may hold; any other is refused, so no option changes what the trace allowed. */
  options: readonly string[];
  /** The positional arguments before the config object; a refusal's reason, or null. */
  check: (args: readonly unknown[]) => string | null;
  /** Where the config object sits among the parameters. */
  configAt: number;
};

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
export const isAddress = (x: unknown): x is string =>
  typeof x === "string" && x.length >= 32 && x.length <= 44 && BASE58.test(x);
const isSignature = (x: unknown) => typeof x === "string" && x.length >= 64 && x.length <= 88 && BASE58.test(x);
const list = (x: unknown, max: number, item: (v: unknown) => boolean) =>
  Array.isArray(x) && x.length >= 1 && x.length <= max && x.every(item);
/** A wire transaction of at most 1,232 bytes, as base64. */
const isWire = (x: unknown) =>
  typeof x === "string" && x.length > 0 && x.length <= 1_644 && /^[A-Za-z0-9+/=]+$/.test(x);

const READ = ["commitment", "minContextSlot"] as const;
const ACCOUNT = ["encoding", "commitment", "dataSlice", "minContextSlot"] as const;

export const METHODS: Readonly<Record<string, MethodSpec>> = {
  getAccountInfo: {
    weight: 1,
    kind: "account",
    options: ACCOUNT,
    configAt: 1,
    check: ([a]) => (isAddress(a) ? null : "an address"),
  },
  getMultipleAccounts: {
    weight: 2,
    kind: "account",
    options: ACCOUNT,
    configAt: 1,
    check: ([a]) => (list(a, 100, isAddress) ? null : "1 to 100 addresses"),
  },
  getBalance: {
    weight: 1,
    kind: "plain",
    options: READ,
    configAt: 1,
    check: ([a]) => (isAddress(a) ? null : "an address"),
  },
  getBlockHeight: { weight: 1, kind: "plain", options: READ, configAt: 0, check: () => null },
  getLatestBlockhash: { weight: 1, kind: "plain", options: READ, configAt: 0, check: () => null },
  getMinimumBalanceForRentExemption: {
    weight: 1,
    kind: "rent",
    options: ["commitment"],
    configAt: 1,
    check: ([size]) =>
      Number.isInteger(size) && (size as number) >= 0 && (size as number) <= 10_485_760 ? null : "a size",
  },
  getSignatureStatuses: {
    weight: 1,
    kind: "plain",
    options: ["searchTransactionHistory"],
    configAt: 1,
    check: ([s]) => (list(s, 16, isSignature) ? null : "1 to 16 signatures"),
  },
  getSignaturesForAddress: {
    weight: 5,
    kind: "plain",
    options: ["limit", "before", "until", ...READ],
    configAt: 1,
    check: ([a]) => (isAddress(a) ? null : "an address"),
  },
  getTransaction: {
    weight: 5,
    kind: "plain",
    options: ["encoding", "commitment", "maxSupportedTransactionVersion"],
    configAt: 1,
    check: ([s]) => (isSignature(s) ? null : "a signature"),
  },
  simulateTransaction: {
    weight: 5,
    kind: "transaction",
    options: ["encoding", "commitment", "sigVerify", "replaceRecentBlockhash", "innerInstructions", "minContextSlot"],
    configAt: 1,
    check: ([t]) => (isWire(t) ? null : "a base64 transaction"),
  },
  sendTransaction: {
    weight: 5,
    kind: "transaction",
    options: ["encoding", "skipPreflight", "preflightCommitment", "maxRetries", "minContextSlot"],
    configAt: 1,
    check: ([t]) => (isWire(t) ? null : "a base64 transaction"),
  },
};

const COMMITMENTS = new Set(["processed", "confirmed", "finalized"]);
const isSlice = (x: unknown) => {
  const s = x as { offset?: unknown; length?: unknown } | null;
  return typeof s === "object" && s !== null && Number.isInteger(s.offset) && Number.isInteger(s.length);
};

/** The parameters of a call to `method`: a refusal's reason, or null when the upstream may see them. */
export function checkParams(method: string, spec: MethodSpec, params: readonly unknown[]): string | null {
  if (params.length > spec.configAt + 1) return "too many parameters";
  const args = params.slice(0, spec.configAt);
  if (args.length < spec.configAt) return `needs ${spec.check([]) ?? "its arguments"}`;
  const wrong = spec.check(args);
  if (wrong) return `needs ${wrong}`;
  const config = params[spec.configAt];
  const base64Only = spec.kind === "transaction" || spec.kind === "account";
  if (config === undefined) return base64Only ? "needs encoding base64" : null;
  if (typeof config !== "object" || config === null || Array.isArray(config)) return "the options must be an object";
  const c = config as Record<string, unknown>;
  for (const key of Object.keys(c)) if (!spec.options.includes(key)) return `option "${key}" is not relayed`;
  for (const key of ["commitment", "preflightCommitment"])
    if (c[key] !== undefined && !COMMITMENTS.has(String(c[key]))) return `unknown ${key}`;
  if (c.dataSlice !== undefined && !isSlice(c.dataSlice)) return "dataSlice needs an offset and a length";
  if (c.limit !== undefined && !(Number.isInteger(c.limit) && (c.limit as number) >= 1 && (c.limit as number) <= 1_000))
    return "limit from 1 to 1000";
  for (const key of ["before", "until"])
    if (c[key] !== undefined && !isSignature(c[key])) return `${key} needs a signature`;
  if (base64Only && c.encoding !== "base64") return "encoding base64 only";
  if (method === "getTransaction" && c.encoding !== undefined && c.encoding !== "json") return "encoding json only";
  return null;
}
