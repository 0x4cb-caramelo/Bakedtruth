/**
 * Purpose: A-8 in the SDK: the program's last deploy read from its ProgramData account (owner first, the loader's
 *          layout, only 45 bytes), and the preparations of a join and of an opening that throw `ProgramUpgraded`
 *          before reading anything else when the deploy is not the one the client was built for, or when the client
 *          knows none. Left out, nothing is checked (the scripts and the keeper). Against the program in LiteSVM.
 *          Filter: `bun test tests/ -t "the program's last deploy"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, getAddressEncoder, type Address } from "@solana/kit";

import {
  assertDeploy,
  BPF_LOADER_UPGRADEABLE_ID,
  deploySlotFrom,
  ProgramDataRefused,
  ProgramUpgraded,
  readProgramData,
  readProgramDeploy,
  ReaderKind,
  Side,
} from "@brot/sdk/read";
import { prepareJoin, prepareOpenCampaign } from "@brot/sdk/tx";

import { BTC_PRICE, openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { now, setUpgradeAuthority, type World } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { ready } from "./prepared";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

/** ProgramData's 45 bytes: state 3, `slot`, and the authority when given. */
function programData(slot: bigint, authority: Address | null): Uint8Array {
  const data = new Uint8Array(45);
  const view = new DataView(data.buffer);
  view.setUint32(0, 3, true);
  view.setBigUint64(4, slot, true);
  if (authority) {
    data[12] = 1;
    data.set(getAddressEncoder().encode(authority), 13);
  }
  return data;
}

/** A deploy (or an upgrade) at `slot`: the world's ProgramData rewritten, its authority kept. */
const deployAt = async (w: World, slot: bigint) =>
  setUpgradeAuthority(w.client, await P.programDataPda(), w.upgradeAuthority.address, slot);

describe("the program's last deploy", () => {
  test("is read from ProgramData's first bytes, owner first", () => {
    const authority = P.PROGRAM_ID;
    expect(readProgramData(BPF_LOADER_UPGRADEABLE_ID, programData(509_389_614n, authority))).toEqual({
      slot: 509_389_614n,
      upgradeAuthority: authority,
    });
    expect(readProgramData(BPF_LOADER_UPGRADEABLE_ID, programData(7n, null).subarray(0, 13))).toEqual({
      slot: 7n,
      upgradeAuthority: null,
    });
    const refused = (owner: string, data: Uint8Array) => {
      try {
        readProgramData(owner, data);
        return null;
      } catch (error) {
        return error instanceof ProgramDataRefused ? error.problem : String(error);
      }
    };
    expect(refused(P.SYSTEM_PROGRAM_ID, programData(1n, null))).toBe("WrongOwner");
    expect(refused(BPF_LOADER_UPGRADEABLE_ID, new Uint8Array(12))).toBe("WrongLength");
    const program = programData(1n, null);
    new DataView(program.buffer).setUint32(0, 2, true); // the Program account's state, not ProgramData
    expect(refused(BPF_LOADER_UPGRADEABLE_ID, program)).toBe("NotProgramData");
    const option = programData(1n, null);
    option[12] = 2;
    expect(refused(BPF_LOADER_UPGRADEABLE_ID, option)).toBe("BadOption");
    expect(refused(BPF_LOADER_UPGRADEABLE_ID, programData(1n, authority).subarray(0, 44))).toBe("WrongLength");
    expect([deploySlotFrom("509389614"), deploySlotFrom(""), deploySlotFrom("12a"), deploySlotFrom(undefined)]).toEqual(
      [509_389_614n, null, null, null],
    );
  });

  test("a preparation stops before anything else when the deploy is not the one the client was built for", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const client = createSolanaRpc(rpc.url);
    await deployAt(w, 42n);
    expect(await readProgramDeploy(client)).toEqual({ slot: 42n, upgradeAuthority: w.upgradeAuthority.address });
    expect((await assertDeploy(client, 42n)).slot).toBe(42n);
    const join = { rpc: client, baker: w.creator, campaign, side: Side.Yes, amount: P.SOL };
    expect(ready(await prepareJoin({ ...join, deploySlot: 42n })).ok).toBe(true);
    expect(ready(await prepareJoin(join)).ok).toBe(true); // left out: not checked (scripts, keeper)
    // An upgrade lands: the client built for slot 42 no longer prepares, nor does one that knows no deploy.
    await deployAt(w, 43n);
    const upgraded = await prepareJoin({ ...join, deploySlot: 42n }).catch((error) => error);
    expect(upgraded).toBeInstanceOf(ProgramUpgraded);
    expect([upgraded.deployedAt, upgraded.builtFor]).toEqual([43n, 42n]);
    expect(await prepareJoin({ ...join, deploySlot: null }).catch((error) => error)).toBeInstanceOf(ProgramUpgraded);
    const choice = {
      kind: ReaderKind.PriceTouch,
      feedId: P.BTC_USD_FEED_ID,
      target: (BTC_PRICE * 11n) / 10n,
      deadlineAt: now(w.client) + 7n * P.DAY,
      openingUsd: 500n,
    };
    const opening = await prepareOpenCampaign({ rpc: client, creator: w.creator, choice, deploySlot: 42n }).catch(
      (error) => error,
    );
    expect(opening).toBeInstanceOf(ProgramUpgraded);
  });
});
