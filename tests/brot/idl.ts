/**
 * Purpose: the Shank IDL (packages/sdk/src/idl/brot_markets.json) in the test kit's terms: struct
 *          fields as layouts.ts types, enums as one byte, names as Shank writes them (camelCase).
 *          Shared by the drift check (idl.test.ts) and the Codama spike (codama-spike.test.ts).
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane F
 */
import { BROT_MARKETS_IDL } from "../../packages/sdk/src";
import { sizeOf, type FieldType, type Layout } from "./layouts";

type IdlType = string | { array: [IdlType, number] } | { defined: string };
type IdlField = { name: string; type: IdlType };
type IdlTypeDef = {
  name: string;
  type: { kind: "struct"; fields: IdlField[] } | { kind: "enum"; variants: { name: string }[] };
};
export type IdlInstruction = {
  name: string;
  accounts: { name: string; isMut: boolean; isSigner: boolean }[];
  args: { name: string; type: IdlType }[];
  discriminant: { type: string; value: number };
};
export type Idl = {
  name: string;
  version: string;
  instructions: IdlInstruction[];
  accounts: IdlTypeDef[];
  types: IdlTypeDef[];
  errors?: { code: number; name: string; msg: string }[];
  metadata: { origin: string; address: string };
};

export const IDL = BROT_MARKETS_IDL as unknown as Idl;

const SCALARS = new Set(["u8", "bool", "u16", "u32", "u64", "i32", "i64", "i128"]);

/** Shank's name for a Rust field: `_reserved` is `reserved`, `fee_vault_bump` is `feeVaultBump`. */
export const camel = (name: string) =>
  name.replace(/^_+/, "").replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function definition(name: string): IdlTypeDef {
  const found = [...IDL.accounts, ...IDL.types].find((t) => t.name === name);
  if (!found) throw new Error(`the IDL defines no type ${name}`);
  return found;
}

function structFields(name: string): IdlField[] {
  const { type } = definition(name);
  if (type.kind !== "struct") throw new Error(`${name} is not a struct`);
  return type.fields;
}

/** The variant names of an IDL enum, in order (Borsh tags them by position). */
export function enumVariants(name: string): string[] {
  const { type } = definition(name);
  if (type.kind !== "enum") throw new Error(`${name} is not an enum`);
  return type.variants.map((v) => v.name);
}

/** An IDL field type in layouts.ts terms; an enum is the byte that stores it. */
function fieldType(type: IdlType): FieldType {
  if (typeof type === "string") {
    if (type === "publicKey") return "pubkey";
    if (SCALARS.has(type)) return type as FieldType;
    throw new Error(`unexpected IDL type ${type}`);
  }
  if ("array" in type) {
    const [item, size] = type.array;
    if (item === "u8") return { bytes: size };
    if (item === "publicKey") return { pubkeys: size };
    throw new Error(`unexpected array of ${JSON.stringify(item)}`);
  }
  const { type: defined } = definition(type.defined);
  return defined.kind === "enum" ? "u8" : { struct: idlLayout(type.defined) };
}

/** The IDL struct (account, argument struct or event) `name` as a layout with Shank's names. */
export function idlLayout(name: string): Layout {
  return structFields(name).map((f) => [f.name, fieldType(f.type)] as const);
}

/** A hand-written layout with Shank's names, nested structs included. */
export function camelLayout(layout: Layout): Layout {
  return layout.map(([name, type]) => {
    const renamed: FieldType =
      typeof type === "object" && "struct" in type ? { struct: camelLayout(type.struct) } : type;
    return [camel(name), renamed] as const;
  });
}

/**
 * Bytes for the IDL struct `name` that every decoder must accept and no wrong one can read the
 * same way: each byte has its high bit set, so a signed field read as unsigned (or the reverse)
 * differs, and neighbours differ, so a shifted field differs. Each enum byte is then a variant
 * and each bool 0 or 1.
 */
export function sampleBytes(name: string): Uint8Array {
  const size = idlLayout(name).reduce((n, [, type]) => n + sizeOf(type), 0);
  const data = Uint8Array.from({ length: size }, (_, i) => 0x80 | ((i * 37 + 11) & 0x7f));
  patch(data, name, 0);
  return data;
}

function patch(data: Uint8Array, name: string, start: number) {
  let at = start;
  for (const field of structFields(name)) {
    const type = field.type;
    if (type === "bool") data[at] &= 1;
    if (typeof type === "object" && "defined" in type) {
      const { type: defined } = definition(type.defined);
      if (defined.kind === "enum") data[at] %= defined.variants.length;
      else patch(data, type.defined, at);
    }
    at += sizeOf(fieldType(type));
  }
}

/** A decoded value with Shank's names and plain arrays, so two decoders can be compared. */
export function normalized(value: unknown): unknown {
  if (value instanceof Uint8Array) return Array.from(value);
  if (Array.isArray(value)) return value.map(normalized);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [camel(k), normalized(v)]));
  }
  return value;
}
