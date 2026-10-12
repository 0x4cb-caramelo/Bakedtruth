/**
 * Purpose: the powers table's keys checked against the chain in the visitor's browser (BR-41; "anyone can re-check"):
 *          the program's upgrade authority from its ProgramData and the admin, fee recipient and team keys from its
 *          config, read through the site's RPC by the SDK, each beside the address content/powers.md publishes. A
 *          mismatch says the chain is right and the page is out of date; a failed read says so and changes nothing.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  configAddress,
  decodeGlobalConfig,
  fetchRaw,
  readProgramDeploy,
  shortAddress,
  type SolanaRpc,
} from "@/lib/brot";
import { rpc } from "@/lib/rpc";
import { KEYS } from "./copy";

export type OnChain = Record<string, string[]>;

/** Each role's keys as the chain holds them now: the upgrade authority (none once final) and the config's keys. */
export async function readKeys(client: SolanaRpc = rpc): Promise<OnChain> {
  const [raw, deploy] = await Promise.all([fetchRaw(client, await configAddress()), readProgramDeploy(client)]);
  if (!raw) throw new Error("no config");
  const c = decodeGlobalConfig(raw);
  return {
    "Upgrade authority": deploy.upgradeAuthority ? [deploy.upgradeAuthority] : [],
    Admin: [c.admin],
    "Fee recipient": [c.feeRecipient],
    "Team key": c.team.slice(0, c.teamLen).map(String),
  };
}

export function LiveKeys({ published }: { published: Record<string, string> }) {
  const [chain, setChain] = useState<OnChain | "reading" | "failed">("reading");
  useEffect(() => {
    let live = true;
    readKeys().then(
      (keys) => live && setChain(keys),
      () => live && setChain("failed"),
    );
    return () => {
      live = false;
    };
  }, []);
  const roles = Object.keys(published);
  const same = (role: string) =>
    typeof chain === "object" && chain[role].length === 1 && chain[role][0] === published[role];
  return (
    <Card as="section" aria-labelledby="keys-live" className="space-y-2 p-4" data-testid="live-keys">
      <h2 id="keys-live" className="panel-head">
        {KEYS.title}
      </h2>
      <p className="m-0 text-sm text-muted">{KEYS.intro}</p>
      {chain === "reading" ? <p className="m-0 text-sm">{KEYS.reading}</p> : null}
      {chain === "failed" ? <p className="m-0 text-sm text-warn">{KEYS.failed}</p> : null}
      {typeof chain === "object" ? (
        <>
          <dl className="m-0 grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 text-sm">
            {roles.map((role) => (
              <div key={role} className="contents">
                <dt className="text-muted">{role}</dt>
                <dd className="m-0 break-all">
                  <code className="text-xs">{chain[role].map(shortAddress).join(", ") || KEYS.none}</code>
                </dd>
                <dd className={`m-0 ${same(role) ? "" : "text-warn"}`} data-role={role}>
                  {same(role) ? KEYS.same : KEYS.differs}
                </dd>
              </div>
            ))}
          </dl>
          {roles.some((role) => !same(role)) ? <p className="m-0 text-sm text-warn">{KEYS.stale}</p> : null}
        </>
      ) : null}
    </Card>
  );
}
