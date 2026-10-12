/**
 * Purpose: the powers table on /record (BR-41, Sprint 13 DoD): content/powers.md drawn on the server, block by block
 *          (headings, paragraphs, tables, inline code), with every address in a table linked to the explorer. No HTML
 *          from the file is ever trusted: its text is React text.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { explorerAddress } from "@/lib/config";
import { inline, type Block } from "./markdown";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function Text({ text }: { text: string }) {
  return (
    <>
      {inline(text).map((part, i) =>
        !part.code ? (
          <span key={i}>{part.text}</span>
        ) : BASE58.test(part.text) ? (
          <a key={i} href={explorerAddress(part.text)} target="_blank" rel="noopener noreferrer" className="break-all">
            <code className="text-xs">{part.text}</code>
          </a>
        ) : (
          <code key={i} className="text-xs">
            {part.text}
          </code>
        ),
      )}
    </>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-panel">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead className="text-left text-xs text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-line px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="align-top">
              {row.map((cell, i) => (
                <td key={i} className={`border-b border-line px-3 py-2 ${i === 0 ? "font-semibold" : ""}`}>
                  <Text text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PowersView({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3" data-perch="powers" data-perch-pose="deadpan">
      {blocks.map((b, i) => {
        if (b.kind === "table") return <Table key={i} head={b.head} rows={b.rows} />;
        if (b.kind === "h1")
          return (
            <h1 key={i} className="t-title">
              {b.text}
            </h1>
          );
        if (b.kind === "h2")
          return (
            <h2 key={i} className="t-section pt-2">
              {b.text}
            </h2>
          );
        return (
          <p key={i} className="m-0 max-w-3xl text-sm">
            <Text text={b.text} />
          </p>
        );
      })}
    </div>
  );
}
