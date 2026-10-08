/**
 * Purpose: the small Markdown the reviewed texts use (docs/legal and docs/wiki) turned into HTML: headings, the Baked's
 *          one-line summaries (block quotes, as <p class="crumb">), tables, lists, rules, bold, code and links.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-08
 */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Inline Markdown. `link` maps each href; external links get rel="noopener". */
export function inline(s, link = (href) => href) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      const url = link(href);
      return /^https?:/.test(url) ? `<a href="${url}" rel="noopener">${text}</a>` : `<a href="${url}">${text}</a>`;
    });
}

/** Converts a document. Options: `link` maps hrefs; `ids` gives h2 and h3 an id, for links to a section. */
export function convert(md, { link, ids = false } = {}) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  const text = (s) => inline(s, link);
  let i = 0;
  const block = (test) => {
    const taken = [];
    while (i < lines.length && test(lines[i])) taken.push(lines[i++]);
    return taken;
  };
  while (i < lines.length) {
    const line = lines[i];
    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) {
      const level = heading[1].length;
      const body = text(heading[2]);
      const id = ids && level > 1 ? ` id="${slug(body)}"` : "";
      out.push(`<h${level}${id}>${body}</h${level}>`);
      i++;
      continue;
    }
    if (!line.trim() || line === "---") {
      if (line === "---") out.push("<hr />");
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const quote = block((l) => l.startsWith(">"))
        .map((l) => l.replace(/^>\s?/, ""))
        .join(" ");
      out.push(`<p class="crumb">${text(quote)}</p>`);
      continue;
    }
    if (line.startsWith("|")) {
      const rows = block((l) => l.startsWith("|")).filter((l) => !/^\|[\s|:-]+\|$/.test(l));
      const cells = (l) =>
        l
          .slice(1, -1)
          .split("|")
          .map((c) => text(c.trim()));
      const [head, ...body] = rows;
      const row = (r, tag) =>
        `<tr>${cells(r)
          .map((c) => `<${tag}>${c}</${tag}>`)
          .join("")}</tr>`;
      out.push(
        `<div class="table"><table><thead>${row(head, "th")}</thead><tbody>` +
          body.map((r) => row(r, "td")).join("") +
          "</tbody></table></div>",
      );
      continue;
    }
    const listItem = /^(- |\d+\. )/;
    if (listItem.test(line)) {
      const tag = /^\d/.test(line) ? "ol" : "ul";
      const items = [];
      while (i < lines.length && (listItem.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (listItem.test(lines[i])) items.push(lines[i].replace(listItem, ""));
        else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      out.push(`<${tag}>${items.map((it) => `<li>${text(it)}</li>`).join("")}</${tag}>`);
      continue;
    }
    const para = block((l) => l.trim() && !/^(#|>|\||- |\d+\. |---$)/.test(l));
    out.push(`<p>${text(para.join(" "))}</p>`);
  }
  return out.join("\n");
}

/** Splits the `title:` and `description:` header of a wiki page from its body. */
export function frontmatter(md) {
  const found = md.replace(/\r/g, "").match(/^---\n([\s\S]*?)\n---\n/);
  if (!found) return { meta: {}, body: md };
  const meta = Object.fromEntries(
    found[1].split("\n").map((l) => {
      const at = l.indexOf(":");
      return [l.slice(0, at).trim(), l.slice(at + 1).trim()];
    }),
  );
  return { meta, body: md.replace(/\r/g, "").slice(found[0].length) };
}
