/**
 * Purpose: the folded figures of the sheet "Check before you sign" (the redesign of 2026-10-15): "Cost breakdown", the
 *          exact total and its three parts to the lamport (the entry, the account rents returned at settlement, the
 *          network fee at most); and "Transaction details", each of the program's fields in plain words with its raw
 *          value under it (`expected_entry_total`, the retry guard; `min_return_bps`, the floor it enforces), the rents,
 *          the fee, the program, and the SDK's deterministic summary, read from the very bytes the wallet signs.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the sheet's redesign
 */
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

import { formatSol, PROGRAM_ID, shortAddress } from "@/lib/brot";
import { CLUSTER, explorerAddress } from "@/lib/config";
import { exactSol } from "@/features/campaign-page/copy-states";
import { SHEET } from "./copy";
import { perOne } from "./estimate";
import type { ReadyJoin } from "./submit";

const Chevron = () => <ChevronDown className="size-3.5" aria-hidden="true" />;

const Line = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <p className="er-line">
    <span>{label}</span>
    <span>{children}</span>
  </p>
);

const TxRow = ({ label, value, note, raw }: { label: string; value: ReactNode; note?: string; raw?: string }) => (
  <div className="er-tx-row">
    <Line label={label}>{value}</Line>
    {note ? <small>{note}</small> : null}
    {raw ? <code>{raw}</code> : null}
  </div>
);

export function ReviewCost({ side, debit }: { side: string; debit: ReadyJoin["debit"] }) {
  return (
    <details className="er-box">
      <summary>
        {SHEET.cost}
        <span>
          {exactSol(debit.total)} SOL
          <Chevron />
        </span>
      </summary>
      <div className="er-box-body">
        <Line label={SHEET.entryOn(side)}>{formatSol(debit.amount)}</Line>
        <Line
          label={
            <>
              {SHEET.rents} <i className="er-tag">{SHEET.rentTag}</i>
            </>
          }
        >
          {formatSol(debit.rents)}
        </Line>
        <Line label={SHEET.feeMax}>{formatSol(debit.networkFee)}</Line>
      </div>
    </details>
  );
}

export function ReviewDetails({ ready }: { ready: ReadyJoin }) {
  const before = ready.expectedEntryTotal;
  return (
    <details className="er-box">
      <summary>
        {SHEET.details}
        <span>
          Solana {CLUSTER}
          <Chevron />
        </span>
      </summary>
      <div className="er-tx">
        <TxRow
          label={SHEET.soFar}
          value={`${exactSol(before)} SOL`}
          note={SHEET.guardNote(exactSol(before))}
          raw={`expected_entry_total ${formatSol(before)}`}
        />
        <TxRow
          label={SHEET.floor}
          value={`${perOne(BigInt(ready.minReturnBps))}×`}
          note={SHEET.floorNote}
          raw={`min_return_bps ${ready.minReturnBps.toLocaleString("en-US")}`}
        />
        <TxRow label={SHEET.rents} value={`${formatSol(ready.debit.rents)} SOL`} note={SHEET.rentsNote} />
        <TxRow label={SHEET.fee} value={`≤ ${formatSol(ready.debit.networkFee)} SOL`} />
        <div className="er-tx-row">
          <Line label={SHEET.program}>
            <a href={explorerAddress(PROGRAM_ID)} target="_blank" rel="noreferrer">
              {shortAddress(PROGRAM_ID)}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </Line>
        </div>
        <details className="er-bytes">
          <summary>
            {SHEET.bytes}
            <Chevron />
          </summary>
          <pre>{ready.summary.lines.join("\n")}</pre>
        </details>
      </div>
    </details>
  );
}
