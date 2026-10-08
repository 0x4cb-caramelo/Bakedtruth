/**
 * Purpose: the byte layouts of the program's accounts, instruction arguments and events, field by
 *          field in the order of the Rust structs, with one encoder and one decoder for all of them.
 *          tests/brot/idl.test.ts (lane F) compares them with the Shank IDL.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); frozen at the sprint's opening with the program's contract
 */
import { getAddressDecoder, getAddressEncoder, type Address } from "@solana/kit";

type Scalar = "u8" | "bool" | "u16" | "u32" | "u64" | "i32" | "i64" | "i128" | "pubkey";
export type FieldType = Scalar | { bytes: number } | { pubkeys: number } | { struct: Layout };
export type Layout = readonly (readonly [string, FieldType])[];

const SCALAR_SIZE: Record<Scalar, number> = {
  u8: 1,
  bool: 1,
  u16: 2,
  u32: 4,
  u64: 8,
  i32: 4,
  i64: 8,
  i128: 16,
  pubkey: 32,
};

export function sizeOf(field: FieldType): number {
  if (typeof field === "string") return SCALAR_SIZE[field];
  if ("bytes" in field) return field.bytes;
  if ("pubkeys" in field) return 32 * field.pubkeys;
  return layoutSize(field.struct);
}
export const layoutSize = (layout: Layout) => layout.reduce((n, [, f]) => n + sizeOf(f), 0);

/** Offset of a top-level field, for tests that tamper with one field of an account. */
export function offsetOf(layout: Layout, name: string): number {
  let at = 0;
  for (const [field, type] of layout) {
    if (field === name) return at;
    at += sizeOf(type);
  }
  throw new Error(`no field ${name}`);
}

// Values: integers as bigint (u8, bool, u16 and u32 as number), pubkeys as Address, bytes as Uint8Array.
export type Value = number | bigint | boolean | Address | Uint8Array | Address[] | Record<string, unknown>;

export function decode(layout: Layout, data: Uint8Array, start = 0): Record<string, any> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const out: Record<string, any> = {};
  let at = start;
  for (const [name, type] of layout) {
    if (typeof type === "string") {
      out[name] = readScalar(view, data, at, type);
    } else if ("bytes" in type) {
      out[name] = data.slice(at, at + type.bytes);
    } else if ("pubkeys" in type) {
      out[name] = Array.from({ length: type.pubkeys }, (_, i) => readScalar(view, data, at + 32 * i, "pubkey"));
    } else {
      out[name] = decode(type.struct, data, at);
    }
    at += sizeOf(type);
  }
  return out;
}

function readScalar(view: DataView, data: Uint8Array, at: number, type: Scalar) {
  switch (type) {
    case "u8":
      return view.getUint8(at);
    case "bool":
      return view.getUint8(at) !== 0;
    case "u16":
      return view.getUint16(at, true);
    case "u32":
      return view.getUint32(at, true);
    case "u64":
      return view.getBigUint64(at, true);
    case "i32":
      return view.getInt32(at, true);
    case "i64":
      return view.getBigInt64(at, true);
    case "i128":
      return view.getBigUint64(at, true) | (view.getBigInt64(at + 8, true) << 64n);
    case "pubkey":
      return getAddressDecoder().decode(data.subarray(at, at + 32));
  }
}

/** Encodes `values` (missing fields are zero) into exactly `layoutSize(layout)` bytes. */
export function encode(layout: Layout, values: Record<string, any>): Uint8Array {
  const data = new Uint8Array(layoutSize(layout));
  const view = new DataView(data.buffer);
  let at = 0;
  for (const [name, type] of layout) {
    const v = values[name];
    if (v !== undefined) {
      if (typeof type === "string") writeScalar(view, data, at, type, v);
      else if ("bytes" in type) data.set(v as Uint8Array, at);
      else if ("pubkeys" in type)
        (v as Address[]).forEach((a, i) => data.set(getAddressEncoder().encode(a), at + 32 * i));
      else data.set(encode(type.struct, v), at);
    }
    at += sizeOf(type);
  }
  return data;
}

function writeScalar(view: DataView, data: Uint8Array, at: number, type: Scalar, v: any) {
  switch (type) {
    case "u8":
      return view.setUint8(at, Number(v));
    case "bool":
      return view.setUint8(at, v ? 1 : 0);
    case "u16":
      return view.setUint16(at, Number(v), true);
    case "u32":
      return view.setUint32(at, Number(v), true);
    case "u64":
      return view.setBigUint64(at, BigInt(v), true);
    case "i32":
      return view.setInt32(at, Number(v), true);
    case "i64":
      return view.setBigInt64(at, BigInt(v), true);
    case "i128": {
      const n = BigInt.asUintN(128, BigInt(v));
      view.setBigUint64(at, n & 0xffff_ffff_ffff_ffffn, true);
      return view.setBigUint64(at + 8, n >> 64n, true);
    }
    case "pubkey":
      return data.set(getAddressEncoder().encode(v as Address), at);
  }
}
