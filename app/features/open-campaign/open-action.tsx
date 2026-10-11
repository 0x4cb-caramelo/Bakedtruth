/**
 * Purpose: the creation box's one button and its total (spec 3.12), at the foot of the preview and in the phone's
 *          sticky bar: "Use Installed Wallet" while no wallet is connected; the first thing that still stops the
 *          opening, as a disabled button, with the others listed under it; or "Review and sign". Nothing here signs:
 *          the review and the signature are use-open-flow.ts's, behind the SDK's preparation (A-3).
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PANEL } from "../entry/copy";
import { readyToReview, type BoxCheck } from "./check";
import { ACTION, MONEY } from "./copy";
import { exactSol } from "./quote";

export function OpenAction(p: {
  check: BoxCheck | null;
  connected: boolean;
  wallet: { installed: boolean; connecting: boolean; connectInstalled: () => void };
  preparing: boolean;
  onReview: () => void;
  /** The phone's bar: one line, no list of reasons. */
  bar?: boolean;
}) {
  const issues = (p.check?.issues ?? []).filter((i) => i.place !== "wallet");
  const ok = p.check !== null && readyToReview(p.check);
  const total = p.check?.total;
  const button = !p.connected ? (
    <Button wide={!p.bar} disabled={!p.wallet.installed || p.wallet.connecting} onClick={p.wallet.connectInstalled}>
      {p.wallet.connecting ? PANEL.connecting : p.wallet.installed ? PANEL.connect : PANEL.noWallet}
    </Button>
  ) : (
    <Button wide={!p.bar} disabled={!ok || p.preparing} onClick={p.onReview}>
      {p.preparing ? PANEL.preparing : ok ? ACTION.review : (p.check?.issues[0]?.tag ?? ACTION.review)}
    </Button>
  );
  if (p.bar) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-panel px-4 py-3 min-[861px]:hidden">
        <p className="min-w-0 flex-1">
          <small className="block text-[11px] text-muted">{MONEY.total}</small>
          <b className="font-display text-xl tabular-nums">
            {total !== null && total !== undefined ? `≈ ${exactSol(total)} SOL` : "–"}
          </b>
        </p>
        {button}
      </div>
    );
  }
  return (
    <div className="space-y-2 border-t border-line p-4">
      <p className="flex items-baseline justify-between text-sm">
        <span>{MONEY.total}</span>
        <b className="font-display text-2xl tabular-nums" data-testid="box-total">
          {total !== null && total !== undefined ? `≈ ${exactSol(total)} SOL` : "–"}
        </b>
      </p>
      {p.connected && issues.length > 1 ? (
        <p className="flex gap-1.5 text-xs text-muted">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {ACTION.also(
              issues
                .slice(1)
                .map((i) => i.tag)
                .join(" · "),
            )}
          </span>
        </p>
      ) : null}
      {/* On a phone the sticky bar carries the button: one button on screen at a time. */}
      <div className="max-[860px]:hidden">{button}</div>
      <p className="text-xs text-muted">{ok ? ACTION.ready : ACTION.wait}</p>
    </div>
  );
}
