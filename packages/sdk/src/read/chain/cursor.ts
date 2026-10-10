/**
 * Purpose: bounds-checked little-endian reads over raw account bytes, for the SDK's readers of other
 *          programs' accounts. An account shorter than its layout is `ReaderBadLayout`, never a read
 *          past the end. Mirrors programs/brot-markets/src/readers/cursor.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { refuse } from "../errors";

export class Cursor {
  private readonly view: DataView;
  private pos = 0;

  constructor(private readonly data: Uint8Array) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  /** Bytes read so far. */
  get position(): number {
    return this.pos;
  }

  /** Moves past `n` bytes, checking they exist. */
  skip(n: number): void {
    if (this.pos + n > this.data.length) refuse("ReaderBadLayout");
    this.pos += n;
  }

  /** The next `n` bytes, copied. */
  take(n: number): Uint8Array {
    const start = this.pos;
    this.skip(n);
    return this.data.slice(start, start + n);
  }

  private at(n: number): number {
    const start = this.pos;
    this.skip(n);
    return start;
  }

  u8 = (): number => this.view.getUint8(this.at(1));
  u16 = (): number => this.view.getUint16(this.at(2), true);
  u32 = (): number => this.view.getUint32(this.at(4), true);
  i32 = (): number => this.view.getInt32(this.at(4), true);
  u64 = (): bigint => this.view.getBigUint64(this.at(8), true);
  i64 = (): bigint => this.view.getBigInt64(this.at(8), true);

  u128(): bigint {
    const at = this.at(16);
    return this.view.getBigUint64(at, true) | (this.view.getBigUint64(at + 8, true) << 64n);
  }

  /** A Borsh `bool` or `Option` tag: exactly 0 or 1, anything else `ReaderBadLayout`. */
  flag(): boolean {
    const byte = this.u8();
    if (byte > 1) refuse("ReaderBadLayout");
    return byte === 1;
  }

  /** A Borsh `Option<T>` whose `T` is `len` bytes. */
  skipOption(len: number): void {
    if (this.flag()) this.skip(len);
  }
}
