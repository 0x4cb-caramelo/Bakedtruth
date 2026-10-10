/**
 * Purpose: why an entry did not go in, as one of the panel's failures, each with its own message (copy-failures.ts).
 *          A program refusal is named by the SDK's error map: its code, its name and the program's own message, read
 *          from the IDL, and only when the program's own instruction failed. A wallet, network or funds failure is told
 *          apart from the RPC's and the wallet's errors. Only a refusal in the wallet, or a preflight that refused to
 *          send, proves "nothing was sent"; any other wallet error may hide a sent transaction, and the retry guard
 *          watches it (retry-guard.ts). A-8's pause (the SDK's `ProgramUpgraded`, thrown before the wallet) is "nothing
 *          was sent" too.
 * Version: 0.3.0 (A-8, 2026-10-10; 0.2.0, the Sprint 11 review: a code is the program's only when its instruction
 *          failed; preflight refusals)
 * Sprint:  11 (site: campaign page and entry)
 */
import {
  BROT_ERROR_CODES,
  customErrorCode,
  errorMessage,
  errorName,
  ProgramDataRefused,
  ProgramUpgraded,
  PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  type BrotErrorName,
} from "@brot/sdk/read";
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
  | "notLanded"
  | "stillChecking"
  | "walletChanged"
  | "programUpgraded"
  | "versionUnknown";

export type Failure = {
  key: FailureKey;
  /** Proven not sent: refused in the wallet, or refused by a preflight simulation before it was sent. */
  notSent?: true;
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
 * A transaction that landed and failed (`getSignatureStatuses` `err`), given the program of the instruction that
 * failed, read from the landed transaction (`null`: not known). A custom code is named as this program's refusal only
 * when this program's instruction failed: a wallet may add instructions of its own, with codes in the same range.
 */
export function fromChainError(err: unknown, retry = false, failedProgram: string | null = null): Failure {
  const code = customErrorCode(err);
  const name = code === null ? undefined : errorName(code);
  if (name && failedProgram === PROGRAM_ID) return fromRefusal(name, retry);
  const ours = failedProgram === PROGRAM_ID || failedProgram === SYSTEM_PROGRAM_ID;
  if ((code === SYSTEM_TOO_FEW_LAMPORTS && ours) || lacksFunds(err)) return plain("notEnoughSol");
  return plain("transactionFailed");
}

/** A person refusing in the wallet: code 4001 (EIP-1193, which wallets copy), or a wallet's own words for it. */
const REFUSED =
  /user rejected|rejected the request|request (was )?rejected|user denied|denied by (the )?user|user declined|declined by (the )?user|cancell?ed by (the )?user|approval denied|request declined/i;

function refusedInWallet(error: unknown): boolean {
  for (let e = error as { code?: unknown; message?: unknown; error?: unknown } | undefined, i = 0; e && i < 4; i++) {
    if (e.code === 4001 || (typeof e.message === "string" && REFUSED.test(e.message))) return true;
    e = e.error as typeof e;
  }
  return false;
}

/**
 * A preflight refusal: the RPC (or the wallet) simulated the transaction and did not send it. The program's code is
 * named only when the message says the first instruction, the one this site built, failed.
 */
function refusedInPreflight(error: unknown): Failure | null {
  const text = `${(error as { message?: string })?.message ?? ""} ${String((error as { error?: unknown })?.error ?? "")}`;
  if (!/simulation failed/i.test(text)) return null;
  const custom = /Instruction 0: custom program error: 0x([0-9a-f]+)/i.exec(text);
  const name = custom ? errorName(parseInt(custom[1], 16)) : undefined;
  const failure = name ? fromRefusal(name) : NO_FUNDS.test(text) ? plain("notEnoughSol") : plain("transactionFailed");
  return { ...failure, notSent: true };
}

/** A network failure on the way to the RPC (a fetch that never answered, an HTTP error from the node). */
export function isNetworkError(error: unknown): boolean {
  const text = `${(error as { name?: string })?.name ?? ""} ${(error as { message?: string })?.message ?? ""}`;
  return /Failed to fetch|fetch failed|NetworkError|Load failed|TRANSPORT|ECONNREFUSED|HTTP error|429/i.test(text);
}

/** What a thrown error means for the panel: refused in the wallet, the network down, or a plain failure. */
export function fromError(error: unknown): Failure {
  // A-8: the program is not the deploy this site was built for (or the site knows none): nothing is signed.
  if (error instanceof ProgramUpgraded) {
    return { ...plain(error.builtFor === null ? "versionUnknown" : "programUpgraded"), notSent: true };
  }
  if (error instanceof ProgramDataRefused) return { ...plain("versionUnknown"), notSent: true };
  if (refusedInWallet(error)) return { ...plain("signatureRefused"), notSent: true };
  const preflight = refusedInPreflight(error);
  if (preflight) return preflight;
  if (isNetworkError(error)) return plain("networkDown");
  return plain("transactionFailed");
}

/** Only these failures prove nothing reached the chain; any other wallet error is watched until it expires. */
export const nothingSent = (failure: Failure): boolean => failure.notSent === true;

export const notLanded = (): Failure => plain("notLanded");
export const failure = plain;
