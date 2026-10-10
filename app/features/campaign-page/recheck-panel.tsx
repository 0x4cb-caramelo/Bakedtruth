/**
 * Purpose: the re-check panel (BR-23; P1 §4.4 "Anyone can re-check. Same account, same answer"; spec 3.7): the account,
 *          its owner, the field the reader reads, the raw value and the slot it was read at, and commands that fetch the
 *          same bytes through any RPC, to copy. Once a result is recorded, the SDK's `recheck(campaign, rpcUrl)` runs on
 *          request through this site's RPC and shows the recorded value beside the one read again.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useState } from "react";
import { ChevronDown, Copy, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Outcome, recheck, type Recheck } from "@/lib/brot";
import { CLUSTER, RPC_URL } from "@/lib/config";
import { RECHECK } from "./copy";
import { grouped, rawText } from "./format";
import type { PageData } from "./load";
import { READER, type Proof } from "./proof";
import { DECODE, recheckCommands } from "./recheck-commands";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [said, setSaid] = useState<string | null>(null);
  const copy = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => setSaid(RECHECK.copied))
      .catch(() => setSaid(RECHECK.copyBlocked));
  return (
    <span className="inline-flex items-center gap-2">
      <Button variant="secondary" small onClick={copy} aria-label={`${RECHECK.copy} ${label}`}>
        <Copy className="size-3.5" aria-hidden="true" />
        {RECHECK.copy}
      </Button>
      <span aria-live="polite" className="text-xs text-muted">
        {said}
      </span>
    </span>
  );
}

export function RecheckPanel({ data, proof }: { data: PageData; proof: Proof }) {
  const c = data.campaign;
  const commands = recheckCommands({
    kind: proof.kind,
    account: proof.account,
    campaign: data.address,
    rpcUrl: RPC_URL,
    cluster: CLUSTER,
  });
  const [tab, setTab] = useState(commands[0].label as string);
  const [result, setResult] = useState<Recheck | "running" | "failed" | null>(null);
  const resolved = c.outcome !== Outcome.Unresolved;
  const command = commands.find((x) => x.label === tab) ?? commands[0];
  const run = () => {
    setResult("running");
    recheck(data.address, RPC_URL).then(setResult, () => setResult("failed"));
  };
  const rows: [string, string][] = [
    [RECHECK.owner, `${READER[proof.kind].owner} · ${READER[proof.kind].ownerId}`],
    [RECHECK.field, READER[proof.kind].field],
    ...(proof.value !== null
      ? ([[RECHECK.value, rawText(proof.value, proof.price ? proof.price.exponent : null)]] as [string, string][])
      : []),
    [RECHECK.slot, grouped(data.chain.slot)],
    ...(proof.price
      ? ([[RECHECK.exponent, `${proof.price.exponent} · ${grouped(proof.price.conf)}`]] as [string, string][])
      : []),
  ];
  return (
    <details className="group rounded-md border border-line bg-panel p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-display text-2xl font-bold">
        <Terminal className="size-5" aria-hidden="true" />
        <span className="flex-1">{RECHECK.title}</span>
        <span className="font-sans text-xs font-normal text-muted max-sm:hidden">{RECHECK.hint}</span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="m-0 mt-3 text-sm">
        <div className="border-t border-line py-2">
          <dt className="text-muted">{RECHECK.account}</dt>
          <dd className="m-0 flex flex-wrap items-center gap-2">
            <span className="break-all font-mono text-xs">{proof.account}</span>
            <CopyButton text={proof.account} label={RECHECK.account} />
          </dd>
        </div>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,9.5rem)_1fr] gap-3 border-t border-line py-2 max-sm:grid-cols-1 max-sm:gap-0.5"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="m-0 break-all font-mono text-xs">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 space-y-2">
        <Segmented
          label={RECHECK.command}
          items={commands.map((x) => ({ id: x.label, label: x.label }))}
          value={tab}
          onChange={setTab}
        />
        <pre
          tabIndex={0}
          aria-label={`${command.label} command`}
          className="m-0 overflow-x-auto whitespace-pre rounded-sm bg-bg p-3 font-mono text-[11px] leading-relaxed"
        >
          <code>{command.text}</code>
        </pre>
        <CopyButton text={command.text} label={command.label} />
        <p className="m-0 text-xs text-muted">{DECODE[proof.kind]}</p>
        <p className="m-0 text-xs text-muted">{RECHECK.anyRpc}</p>
      </div>
      {resolved ? <RecheckResult result={result} onRun={run} /> : null}
    </details>
  );
}

function RecheckResult({ result, onRun }: { result: Recheck | "running" | "failed" | null; onRun: () => void }) {
  const done = result !== null && result !== "running" && result !== "failed" ? result : null;
  const verdict = done
    ? done.matches === null
      ? RECHECK.cannot(done.note)
      : done.matches
        ? RECHECK.matches
        : done.consistent
          ? RECHECK.consistent
          : RECHECK.differs
    : null;
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
      <Button variant="secondary" onClick={onRun} disabled={result === "running"}>
        {result === "running" ? RECHECK.running : RECHECK.run}
      </Button>
      {result === "failed" ? <p className="m-0 text-warn">{RECHECK.failed}</p> : null}
      {done ? (
        <div aria-live="polite" className="space-y-1">
          <p className="m-0 font-mono text-xs">
            {RECHECK.recorded}: {grouped(done.recorded)} · {RECHECK.reread}:{" "}
            {done.reread === null ? "—" : grouped(done.reread)}
          </p>
          <p className="m-0">{verdict}</p>
        </div>
      ) : null}
    </div>
  );
}
