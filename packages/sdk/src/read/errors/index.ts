/**
 * Purpose: one message per program error code, read from the IDL, and the refusal the SDK throws
 *          when its mirror of a program rule refuses (math, creation checks), carrying the same
 *          name and code the program would return.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * The Codama client also renders messages, but behind `process.env.NODE_ENV` (a Node global) and
 * blanked in production bundles, so the SDK reads the IDL instead: the same text, on every runtime.
 */
import idl from "../../idl/brot_markets.json";
import { BROT_ERROR_CODES, type BrotErrorName } from "./codes";

export { BROT_ERROR_CODES, type BrotErrorName } from "./codes";

type IdlError = { code: number; name: string; msg: string };

const BY_CODE: ReadonlyMap<number, IdlError> = new Map(
  (idl.errors as IdlError[]).map((error) => [error.code, error] as const),
);

/** The program's message for `code`, or `undefined` for a code the program does not define. */
export function errorMessage(code: number): string | undefined {
  return BY_CODE.get(code)?.msg;
}

/** The error's name for `code` (`MathOverflow` for 6000), or `undefined`. */
export function errorName(code: number): BrotErrorName | undefined {
  const name = BY_CODE.get(code)?.name;
  return name !== undefined && name in BROT_ERROR_CODES ? (name as BrotErrorName) : undefined;
}

/** Every code the program defines, in order, with its name and message. */
export function programErrors(): readonly IdlError[] {
  return [...BY_CODE.values()];
}

/**
 * A refusal of a program rule, raised by the SDK's mirror of it. `errorName` and `code` are the
 * ones the program returns for the same input, so a preview can say exactly why the program
 * would refuse.
 */
export class BrotRefusal extends Error {
  readonly errorName: BrotErrorName;
  readonly code: number;

  constructor(errorName: BrotErrorName) {
    const code = BROT_ERROR_CODES[errorName];
    super(`${errorName} (${code}): ${errorMessage(code) ?? "unknown error"}`);
    this.name = "BrotRefusal";
    this.errorName = errorName;
    this.code = code;
  }
}

/** Throws the refusal `errorName`; typed `never` so it ends any expression. */
export function refuse(errorName: BrotErrorName): never {
  throw new BrotRefusal(errorName);
}

/** `error` is a `BrotRefusal` (named `errorName`, when given). */
export function isRefusal(error: unknown, errorName?: BrotErrorName): error is BrotRefusal {
  return error instanceof BrotRefusal && (errorName === undefined || error.errorName === errorName);
}

/**
 * The custom program error code in a failed transaction's `err`, as the RPC returns it
 * (`{ InstructionError: [index, { Custom: code }] }`), or as a Kit `SolanaError` carries it in
 * `context.code`. `null` for any other failure.
 */
export function customErrorCode(err: unknown): number | null {
  const instructionError = (err as { InstructionError?: [unknown, unknown] } | null)?.InstructionError;
  const custom = (instructionError?.[1] as { Custom?: unknown } | undefined)?.Custom;
  if (typeof custom === "number" || typeof custom === "bigint") return Number(custom);
  const context = (err as { context?: { code?: unknown } } | null)?.context;
  if (typeof context?.code === "number" || typeof context?.code === "bigint") return Number(context.code);
  return null;
}
