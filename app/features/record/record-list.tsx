/**
 * Purpose: the public record (Sprint 12 DoD: voids and decisions, with reasons, from content/void-log/; BR-45), drawn
 *          on the server from the void log: each void with its campaign, the team's reason and what it means for the
 *          opening fee, the acting team key, the time, the team's text and the SHA-256 anyone can compare with the
 *          campaign's `void_note_hash` on-chain; each correction with the record it corrects. No script runs here.
 * Version: 0.1.1 (Sprint 13: a section under the powers table, so its title is an h2)
 * Sprint:  12 (site: my entries and campaign states); 13
 */
import type { VoidLogRecord } from "@brot/sdk/schemas";
import { shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { RECORD, TEAM_REASON } from "./copy";
import type { VoidLog } from "./load-void-log";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <dt className="text-muted">{label}</dt>
    <dd className="m-0 min-w-0 break-words">{children}</dd>
  </>
);

const Address = ({ value }: { value: string }) => (
  <a
    href={explorerAddress(value)}
    target="_blank"
    rel="noopener noreferrer"
    className="text-accent-soft hover:underline"
  >
    {shortAddress(value)}
  </a>
);

function Item({ record }: { record: VoidLogRecord }) {
  return (
    <li className="space-y-2 rounded-md border border-line bg-panel p-4" data-kind={record.kind}>
      <h3 className="m-0 font-display text-2xl font-bold">
        {record.kind === "void" ? RECORD.void : RECORD.correction}
      </h3>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {record.kind === "void" ? (
          <>
            <Field label={RECORD.campaign}>
              <Address value={record.campaign} />
            </Field>
            <Field label={RECORD.reason}>{TEAM_REASON[record.reason]}</Field>
          </>
        ) : (
          <Field label={RECORD.corrects}>{record.corrects}</Field>
        )}
        <Field label={RECORD.teamKey}>
          <Address value={record.teamKey} />
        </Field>
        <Field label={RECORD.written}>{record.writtenAt.replace("T", " ").replace(/\.\d+Z$/, " UTC")}</Field>
        <Field label={RECORD.sha256}>
          <code className="text-xs">{record.sha256}</code>
        </Field>
      </dl>
      <p className="m-0 whitespace-pre-line text-sm">{record.text}</p>
    </li>
  );
}

export function RecordList({ log }: { log: VoidLog }) {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h2 className="t-section">{RECORD.title}</h2>
        <p className="m-0 max-w-3xl text-sm text-muted">{RECORD.intro}</p>
        <p className="m-0 max-w-3xl text-sm text-muted">{RECORD.check}</p>
        <p className="m-0 max-w-3xl text-xs text-muted">{RECORD.automatic}</p>
      </header>
      {log.records.length === 0 ? (
        <p className="m-0 rounded-md border border-line bg-panel p-4 text-sm text-muted">{RECORD.empty}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0">
          {log.records.map((record) => (
            <Item key={record.file} record={record} />
          ))}
        </ul>
      )}
      {log.skipped.length > 0 ? <p className="m-0 text-xs text-warn">{RECORD.skipped(log.skipped.length)}</p> : null}
    </div>
  );
}
