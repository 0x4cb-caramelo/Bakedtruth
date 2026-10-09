/**
 * Purpose: the mutations of the slot matrix: one slot of a valid instruction changed (unsigned,
 *          read-only, a stranger, an account of another type, or an alias of an earlier slot), and the
 *          fresh accounts those mutations need.
 * Version: 0.0.1
 * Sprint:  04 (lane F). Used by slot-matrix.test.ts and scripts/measure-cu.ts only.
 */
import { AccountRole, generateKeyPairSigner, lamports, type Address, type Instruction } from "@solana/kit";

import { layoutSize } from "./layouts";
import * as P from "./program";
import { fundedWallet, type World } from "./setup";
import { ENTRY, GLOBAL_CONFIG, JOIN } from "./structs";
import { withSlot } from "./instructions";
import type { SlotCase } from "./slot-matrix.gen";

type Src = "Token" | "Config" | "Campaign" | "Entry" | "Join";

/** Data size and the first byte (the account tag, for program types) of each source type. */
const SHAPE: Record<Src, { size: number; tag?: number; owner: Address }> = {
  Token: { size: 165, owner: P.SPL_TOKEN_PROGRAM_ID },
  Config: { size: layoutSize(GLOBAL_CONFIG), tag: 1, owner: P.PROGRAM_ID },
  Campaign: { size: 512, tag: 2, owner: P.PROGRAM_ID },
  Entry: { size: layoutSize(ENTRY), tag: 3, owner: P.PROGRAM_ID },
  Join: { size: layoutSize(JOIN), tag: 5, owner: P.PROGRAM_ID }, // AccountTag::Join, tag 5 (state/join.rs)
};

/** A fresh account of `src` at a fresh address, with the layout's tag and version bytes set. */
export async function typedAccount(w: World, src: Src): Promise<Address> {
  const address = (await generateKeyPairSigner()).address;
  const { size, tag, owner } = SHAPE[src];
  const data = new Uint8Array(size);
  if (tag !== undefined) {
    data[0] = tag;
    data[1] = 1; // LAYOUT_VERSION
  }
  w.client.svm.setAccount({
    address,
    data,
    executable: false,
    lamports: lamports(w.client.svm.minimumBalanceForRentExemption(BigInt(size))),
    programAddress: owner,
    space: BigInt(size),
  });
  return address;
}

const isSigning = (role: AccountRole) => role === AccountRole.READONLY_SIGNER || role === AccountRole.WRITABLE_SIGNER;

/** The instruction `base` with the slot of `c` mutated as the case says. */
export async function mutate(w: World, base: Instruction, c: SlotCase): Promise<Instruction> {
  const role = base.accounts![c.i].role;
  const signs = isSigning(role);
  switch (c.cat) {
    case "unsigned":
      return withSlot(base, c.i, { role: signs ? AccountRole.WRITABLE : AccountRole.READONLY, signer: undefined });
    case "readonly":
      return withSlot(base, c.i, { role: signs ? AccountRole.READONLY_SIGNER : AccountRole.READONLY });
    case "stranger": {
      const stranger = await fundedWallet(w);
      return signs
        ? withSlot(base, c.i, { address: stranger.address, role: AccountRole.WRITABLE_SIGNER, signer: stranger })
        : withSlot(base, c.i, { address: stranger.address, role: AccountRole.WRITABLE });
    }
    case "type": {
      const address = await typedAccount(w, c.src as Src);
      return withSlot(base, c.i, { address, role: AccountRole.WRITABLE });
    }
    case "alias": {
      const address = base.accounts![c.with!].address;
      return withSlot(base, c.i, { address, role: AccountRole.WRITABLE });
    }
  }
}
