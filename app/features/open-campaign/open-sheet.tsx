/**
 * Purpose: the one dialog of an opening, from "Review and sign" to the campaign's link (spec 3.12): the recent opening
 *          found on-chain (or the look-up that failed), the review (open-review.tsx), the signing steps and a failure
 *          (sheet-steps.tsx), the opened campaign with its receipt and link, the retried opening already open (T17), and
 *          the id another wallet took. It cannot be closed while the wallet has the transaction; while the page
 *          confirms or checks, it can: the id is saved and the watch goes on.
 * Version: 0.2.0 (the Sprint 19 reviews: the steps split out, the recent look-up's failure)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { RefusalContext } from "./copy-refusals";
import { ALREADY, DONE, FAIL, failTitle, RECENT, SHEET, STEPS, TAKEN } from "./copy-sheet";
import type { OpenFlow } from "./flow-state";
import { OpenReview } from "./open-review";
import { exactSol, usdText } from "./quote";
import { Failed, Signing } from "./sheet-steps";

type ReviewProps = Omit<
  Parameters<typeof OpenReview>[0],
  "ready" | "choice" | "metric" | "refreshed" | "onSign" | "onBack"
>;

const Go = ({ id, text }: { id: bigint; text: string }) => (
  <Link
    href={`/c/${id}`}
    className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-cta-bg px-4 text-sm font-semibold text-on-accent hover:bg-cta-hover"
  >
    {text}
  </Link>
);

export function OpenSheet(p: {
  flow: OpenFlow;
  review: ReviewProps;
  /** The kind's names, for a refusal that names the account's owner (row 2). */
  context: RefusalContext;
  onSign: () => void;
  onAgain: () => void;
  onAnyway: () => void;
  onCheck: () => void;
  onClose: () => void;
}) {
  const { flow } = p;
  const open = flow.step !== "idle" && flow.step !== "preparing";
  const title =
    flow.step === "review"
      ? SHEET.title
      : flow.step === "recent"
        ? flow.check.status === "found"
          ? RECENT.title
          : RECENT.unknownTitle
        : flow.step === "signing"
          ? flow.stage === "checking"
            ? STEPS.checking
            : STEPS.title
          : flow.step === "done"
            ? flow.outcome.kind === "opened"
              ? DONE.title
              : flow.outcome.kind === "already"
                ? ALREADY.title(flow.outcome.id.toString())
                : TAKEN.title
            : flow.step === "failed"
              ? (FAIL[flow.failure.key]?.title ?? failTitle(flow.failure.name !== null))
              : "";
  return (
    // Only the wallet's own step holds the sheet: once sent or being checked, the id is saved and closing loses nothing.
    <Dialog
      open={open}
      title={title}
      onClose={p.onClose}
      dismissable={!(flow.step === "signing" && flow.stage === "wallet")}
    >
      {flow.step === "review" ? (
        <OpenReview
          {...p.review}
          ready={flow.ready}
          choice={flow.choice}
          metric={flow.metric}
          refreshed={flow.refreshed}
          onBack={p.onClose}
          onSign={p.onSign}
        />
      ) : flow.step === "recent" ? (
        <div className="space-y-3 text-sm">
          {flow.check.status === "found" ? (
            <>
              <p>
                {RECENT.text(
                  flow.check.opening.id.toString(),
                  flow.check.opening.at === null ? null : RECENT.ago(flow.chainNow - flow.check.opening.at),
                )}
              </p>
              <Go id={flow.check.opening.id} text={RECENT.go} />
            </>
          ) : (
            <>
              <p>{RECENT.unknownText}</p>
              <Button wide onClick={p.onAgain}>
                {RECENT.checkAgain}
              </Button>
            </>
          )}
          <Button variant="secondary" wide onClick={p.onAnyway}>
            {flow.check.status === "found" ? RECENT.anyway : RECENT.anywayUnknown}
          </Button>
        </div>
      ) : flow.step === "signing" ? (
        <Signing flow={flow} />
      ) : flow.step === "done" ? (
        <div className="space-y-3 text-sm">
          {flow.outcome.kind === "opened" ? (
            <>
              <p>{flow.outcome.finalized ? DONE.final : DONE.confirmedOnly}</p>
              {flow.receipt ? (
                <p className="text-sm" data-testid="receipt">
                  {DONE.charged(exactSol(flow.receipt.paid), usdText(flow.receipt.price, flow.receipt.exponent))}
                </p>
              ) : null}
              <p className="text-xs text-muted">{DONE.listed}</p>
              <Go id={flow.outcome.id} text={DONE.go} />
            </>
          ) : flow.outcome.kind === "already" ? (
            <>
              <p>{ALREADY.text}</p>
              <Go id={flow.outcome.id} text={ALREADY.go} />
            </>
          ) : (
            <p>{TAKEN.text}</p>
          )}
        </div>
      ) : flow.step === "failed" ? (
        <Failed flow={flow} context={p.context} onAgain={p.onAgain} onCheck={p.onCheck} onClose={p.onClose} />
      ) : null}
    </Dialog>
  );
}
