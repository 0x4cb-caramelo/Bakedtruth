/**
 * Purpose: why an entry did not go in, as one of the panel's failures, each with its own message (copy-failures.ts).
 *          A program refusal is named by the SDK's error map: its code, its name and the program's own message, read
 *          from the IDL. A wallet, network or funds failure is told apart from the RPC's and the wallet's errors. Only
 *          an explicit refusal in the wallet means "nothing was sent"; any other wallet error may hide a sent
 *          transaction, so the retry guard watches it (retry-guard.ts).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { BROT_ERROR_CODES, customErrorCode, errorMessage, errorName, type BrotErrorName } from "@brot/sdk/read";
import type { Simulation } from "@brot/sdk/tx";

export type FailureKey =
  | "entriesClosed"
  | "outcomeKnown"
  | "noFreshPrice"
  | "priceTooClose"
  | "paused"
  | "belowMinimum"
  | "notEnoughSol"
  | "entryChanged"
  | "alreadyLanded"
  | "returnBelowMinimum"
  | "signatureRefused"
  | "transactionFailed"
  | "networkDown"
  | "notLanded";

export type Failure = {
  key: FailureKey;
  /** The program's error, when the failure is one of its refusals. */
  code: number | null;
  name: BrotErrorName | null;
  programMessage: string | null;
};

/** The program's refusals of a join, by the failure the panel tells. Any other refusal is "transactionFailed". */
const BY_REFUSAL: Partial<Record<BrotErrorName, FailureKey>> = {
  CampaignNotOpen: "entriesClosed",
  EntriesClosed: "entriesClosed",
  OutcomeKnowable: "outcomeKnown",
  JoinPriceStale: "noFreshPrice",
  JoinBufferRefused: "priceTooClose",
  JoinWhilePaused: "paused",
  BelowCampaignMinEntry: "belowMinimum",
  EntryBelowMinimum: "belowMinimum",
  EntryTotalMismatch: "entryChanged",
  ReturnBelowMinimum: "returnBelowMinimum",
};

const plain = (key: FailureKey): Failure => ({ key, code: null, name: null, programMessage: null });

/** A refusal of the program (or of the SDK's mirror of it), by name. On a retry, a changed entry means it landed. */
export function fromRefusal(name: BrotErrorName, retry = false): Failure {
  const code = BROT_ERROR_CODES[name];
  const key = BY_REFUSAL[name] ?? "transactionFailed";
  return {
    key: retry && key === "entryChanged" ? "alreadyLanded" : key,
    code,
    name,
    programMessage: errorMessage(code) ?? null,
  };
}

/** SystemError::ResultWithNegativeLamports: the System Program's transfer found too few lamports. */
const SYSTEM_TOO_FEW_LAMPORTS = 1;

/** The node's words for a payer that cannot cover the fee or a rent. */
const NO_FUNDS = /InsufficientFunds|insufficient (lamports|funds)/i;

function lacksFunds(err: unknown, logs: readonly string[] = []): boolean {
  return (
    NO_FUNDS.test(typeof err === "string" ? err : (JSON.stringify(err, bigints) ?? "")) ||
    logs.some((l) => NO_FUNDS.test(l))
  );
}
const bigints = (_: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

/** A failed simulation: the program's refusal by name, or too little SOL, or a plain failure. */
export function fromSimulation(simulation: Simulation, retry = false): Failure {
  if (simulation.errorName) return fromRefusal(simulation.errorName, retry);
  if (simulation.errorCode === SYSTEM_TOO_FEW_LAMPORTS || lacksFunds(simulation.err, simulation.logs)) {
    return plain("notEnoughSol");
  }
  return plain("transactionFailed");
}

/**
 * A transaction that landed and failed (`getSignatureStatuses` `err`). A custom code is read as the program's only
 * when the program defines it: a wallet may append its own instructions, whose codes the page cannot place.
 */
export function fromChainError(err: unknown, retry = false): Failure {
  const code = customErrorCode(err);
  const name = code === null ? undefined : errorName(code);
  if (name) return fromRefusal(name, retry);
  if (code === SYSTEM_TOO_FEW_LAMPORTS || lacksFunds(err)) return plain("notEnoughSol");
  return plain("transactionFailed");
}

/** The wallet's own errors: 4001 is a person refusing (EIP-1193 and the wallets that copy it). */
function refusedInWallet(error: unknown): boolean {
  for (let e = error as { code?: unknown; message?: unknown; error?: unknown } | undefined, i = 0; e && i < 4; i++) {
    if (e.code === 4001 || (typeof e.message === "string" && /reject|denied|declined|cancel/i.test(e.message))) {
      return true;
    }
    e = e.error as typeof e;
  }
  return false;
}

/** A network failure on the way to the RPC (a fetch that never answered, an HTTP error from the node). */
export function isNetworkError(error: unknown): boolean {
  const text = `${(error as { name?: string })?.name ?? ""} ${(error as { message?: string })?.message ?? ""}`;
  return /Failed to fetch|fetch failed|NetworkError|Load failed|TRANSPORT|ECONNREFUSED|HTTP error|429/i.test(text);
}

/** What a thrown error means for the panel: refused in the wallet, the network down, or a plain failure. */
export function fromError(error: unknown): Failure {
  if (refusedInWallet(error)) return plain("signatureRefused");
  if (isNetworkError(error)) return plain("networkDown");
  return plain("transactionFailed");
}

/** Only these failures prove nothing reached the chain; any other wallet error is watched until it expires. */
export const nothingSent = (failure: Failure): boolean => failure.key === "signatureRefused";

export const notLanded = (): Failure => plain("notLanded");
export const failure = plain;
