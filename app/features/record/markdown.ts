/**
 * Purpose: the few Markdown blocks content/powers.md uses, parsed without a library (Sprint 13): headings, paragraphs,
 *          pipe tables (a header, a separator, rows) and inline `code`. Text stays text: nothing becomes HTML, so React
 *          escapes all of it. Also reads the keys table back by role, for the page's live check against the chain.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
export type Block = { kind: "h1" | "h2" | "p"; text: string } | { kind: "table"; head: string[]; rows: string[][] };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("## ")) blocks.push({ kind: "h2", text: line.slice(3).trim() });
    else if (line.startsWith("# ")) blocks.push({ kind: "h1", text: line.slice(2).trim() });
    else if (line.trim().startsWith("|")) {
      const table: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) table.push(lines[i++]);
      i--;
      const [head, , ...rows] = table;
      blocks.push({ kind: "table", head: cells(head), rows: rows.map(cells) });
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#|\|)/.test(lines[i].trim())) para.push(lines[i++].trim());
      i--;
      blocks.push({ kind: "p", text: para.join(" ") });
    }
  }
  return blocks;
}

/** Inline `code` spans and plain text, in order. */
export const inline = (text: string): { code: boolean; text: string }[] =>
  text
    .split(/(`[^`]+`)/)
    .filter(Boolean)
    .map((part) => (part.startsWith("`") ? { code: true, text: part.slice(1, -1) } : { code: false, text: part }));

/** The keys table ("Role | Address | …"): each role's published address, without its code marks. */
export function publishedKeys(blocks: Block[]): Record<string, string> {
  const table = blocks.find(
    (b): b is Extract<Block, { kind: "table" }> => b.kind === "table" && b.head[1] === "Address",
  );
  return Object.fromEntries((table?.rows ?? []).map((row) => [row[0], row[1].replace(/`/g, "")]));
}
