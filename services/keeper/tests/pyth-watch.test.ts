/**
 * Purpose: the Pyth upgrade watch (Sprint 07 carried item): the receiver's ProgramData derives to the address the
 *          knowledge base recorded (`3UV7w2…`, the same on both clusters); readings equal to the deploys recorded for
 *          devnet raise nothing; a new deploy slot or a new upgrade authority raises `pyth_program_changed` once, then
 *          becomes the reference; a ProgramData that vanishes raises it too; on a local cluster the first reading is
 *          the reference. A fake RPC answers `getMultipleAccounts` with ProgramData bytes; no cluster.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the watchdog also watches Pyth)
 */
import { describe, expect, test } from "bun:test";
import { getAddressEncoder, getBase64Decoder, type Address } from "@solana/kit";
import { BPF_LOADER_UPGRADEABLE_ID, PYTH_RECEIVER_ID, type SolanaRpc } from "@brot/sdk/read";

import type { AlertDetail, AlertKind, Alerter } from "../src/alert";
import { createPythWatch, KNOWN_DEPLOYS, programDataOf } from "../src/pyth-watch";

/** The loader's ProgramData header: state 3, the slot, and the authority as an Option<Pubkey>. */
function programData(slot: bigint, authority: Address | null): string {
  const data = new Uint8Array(45);
  const view = new DataView(data.buffer);
  view.setUint32(0, 3, true);
  view.setBigUint64(4, slot, true);
  if (authority) {
    data[12] = 1;
    data.set(getAddressEncoder().encode(authority), 13);
  }
  return getBase64Decoder().decode(data);
}

/** A fake RPC whose `getMultipleAccounts` answers the next set of [receiver, push oracle] accounts. */
function fakeRpc(rounds: Array<[string | null, string | null]>) {
  let i = 0;
  const account = (data: string | null) => (data ? { owner: BPF_LOADER_UPGRADEABLE_ID, data: [data, "base64"] } : null);
  return {
    getMultipleAccounts: () => ({
      send: async () => ({ value: rounds[Math.min(i++, rounds.length - 1)]!.map(account) }),
    }),
  } as unknown as SolanaRpc;
}

function spy() {
  const fired: Array<{ kind: AlertKind; key: string; detail: AlertDetail }> = [];
  const alerter: Alerter = { alert: (kind, key, detail) => (fired.push({ kind, key, detail }), true) };
  return { fired, alerter };
}

const known = KNOWN_DEPLOYS.devnet;
const recorded = (name: "receiver" | "pushOracle", slot = known[name].slot, authority = known[name].upgradeAuthority) =>
  programData(slot, authority);

describe("the Pyth upgrade watch", () => {
  test("the receiver's ProgramData is the address the knowledge base recorded", async () => {
    expect(await programDataOf(PYTH_RECEIVER_ID)).toBe("3UV7w2yTaqVcUAbWm1KUXdcE1Ziw8CfyyCpZvhKFkPfX" as Address);
  });

  test("the recorded devnet deploys raise nothing; a new slot or a new authority raises once", async () => {
    const { fired, alerter } = spy();
    const watch = createPythWatch("devnet", alerter);
    const same: [string, string] = [recorded("receiver"), recorded("pushOracle")];
    const upgraded: [string, string] = [recorded("receiver", known.receiver.slot + 1_000n), recorded("pushOracle")];
    const rpc = fakeRpc([same, upgraded, upgraded]);
    const first = await watch.check(rpc);
    expect(first.receiver).toEqual({ slot: "460336311", upgradeAuthority: known.receiver.upgradeAuthority });
    expect(fired).toEqual([]);
    await watch.check(rpc);
    await watch.check(rpc); // the new reading is the reference now
    expect(fired).toEqual([
      {
        kind: "pyth_program_changed",
        key: "receiver",
        detail: {
          program: PYTH_RECEIVER_ID,
          expectedSlot: "460336311",
          expectedAuthority: known.receiver.upgradeAuthority,
          slot: (known.receiver.slot + 1_000n).toString(),
          authority: known.receiver.upgradeAuthority,
          error: null,
        },
      },
    ]);
  });

  test("a new upgrade authority, or a ProgramData that vanishes, raises the alert", async () => {
    const { fired, alerter } = spy();
    const watch = createPythWatch("devnet", alerter);
    const other = "11111111111111111111111111111112" as Address;
    await watch.check(fakeRpc([[recorded("receiver"), recorded("pushOracle", undefined, other)]]));
    await watch.check(fakeRpc([[null, recorded("pushOracle", undefined, other)]]));
    expect(fired.map((f) => [f.key, f.detail.authority, f.detail.error])).toEqual([
      ["pushOracle", other, null],
      ["receiver", null, "ProgramData missing"],
    ]);
  });

  test("on a local cluster the first reading is the reference: a missing Pyth raises nothing", async () => {
    const { fired, alerter } = spy();
    const watch = createPythWatch("local", alerter);
    const report = await watch.check(fakeRpc([[null, null]]));
    await watch.check(fakeRpc([[null, null]]));
    expect(report.receiver).toEqual({ error: "ProgramData missing" });
    expect(fired).toEqual([]);
  });
});
