/**
 * Purpose: the account slot of the creation box (D-i: any address; spec 3.12's states): empty, not an address, checking,
 *          no account there, refused by the kind's reader (owner first, then the layout, and the burn and stake-pool
 *          rules), couldn't be read, or accepted, with a reviewed name when two people gave it one (A-11) and always
 *          its shortened address and an explorer link. Known names for the kind are one click away.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId } from "react";
import { Check, CircleAlert, ExternalLink, LoaderCircle, X } from "lucide-react";
import { isAddress } from "@solana/kit";

import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { KIND_NAME } from "../campaign-page/copy";
import type { KindName } from "../campaign-page/proof";
import { ACCOUNT } from "./copy";
import { refusalCopy } from "./copy-refusals";
import { templateOf } from "./kinds";
import type { KnownName } from "./names";
import type { SlotRead } from "./preview";

function State({ kind, text, read, names }: { kind: KindName; text: string; read: SlotRead; names: KnownName[] }) {
  const t = templateOf(kind);
  if (!text) return <p className="text-xs text-muted">{ACCOUNT.help}</p>;
  if (!isAddress(text)) return <p className="text-xs text-muted">{ACCOUNT.notAddress}</p>;
  const row = "flex items-start gap-2 rounded-sm px-3 py-2 text-xs";
  if (read.status === "checking")
    return (
      <p className={`${row} bg-raised`}>
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        {ACCOUNT.checking}
      </p>
    );
  if (read.status === "failed")
    return (
      <p className={`${row} bg-st-review-bg text-st-review-fg`}>
        <CircleAlert className="size-4" aria-hidden="true" />
        {ACCOUNT.readFailed}
      </p>
    );
  const state = read.state;
  if (state.state !== "ok") {
    const message =
      state.state === "missing"
        ? ACCOUNT.missing
        : refusalCopy(state.refusal).text({ owner: t.owner, kind: KIND_NAME[kind] });
    return (
      <p
        className={`${row} bg-danger-bg text-error`}
        data-refusal={state.state === "refused" ? state.refusal : "missing"}
      >
        <X className="size-4 shrink-0" aria-hidden="true" />
        {message}
      </p>
    );
  }
  const name = names.find((n) => n.address === text && n.kind === kind)?.name;
  const owner = t.owner.replace(/^the /, "");
  return (
    <p className={`${row} bg-st-open-bg text-st-open-fg`}>
      <Check className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block">{name ? ACCOUNT.named(name, owner) : ACCOUNT.unnamed(owner)}</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono" title={text}>
            {shortAddress(text)}
          </span>
          <a
            href={explorerAddress(text)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline"
          >
            {ACCOUNT.explorer}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </span>
      </span>
    </p>
  );
}

export function AccountSlot({
  kind,
  value,
  read,
  names,
  onChange,
  onCheckAgain,
}: {
  kind: KindName;
  value: string;
  read: SlotRead;
  names: KnownName[];
  onChange: (address: string) => void;
  onCheckAgain: () => void;
}) {
  const id = useId();
  const known = names.filter((n) => n.kind === kind);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {ACCOUNT.label(templateOf(kind).slot ?? "")}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        autoComplete="off"
        spellCheck={false}
        placeholder={ACCOUNT.placeholder}
        aria-describedby={`${id}-state`}
        className="min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 py-2.5 font-mono text-sm text-text"
      />
      {known.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">{ACCOUNT.known}</span>
          {known.map((n) => (
            <Button key={n.address} variant="secondary" small onClick={() => onChange(n.address)}>
              {n.name}
            </Button>
          ))}
        </div>
      ) : null}
      <div id={`${id}-state`} aria-live="polite">
        <State kind={kind} text={value} read={read} names={names} />
      </div>
      {read.status === "failed" && isAddress(value) ? (
        <Button variant="secondary" small onClick={onCheckAgain}>
          {ACCOUNT.checkAgain}
        </Button>
      ) : null}
    </div>
  );
}
