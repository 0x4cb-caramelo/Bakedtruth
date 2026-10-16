/**
 * Purpose: the home page's "How it works" closes for good in this browser (features/home/how-closed.ts): the head script
 *          marks <html> only for the stored "closed", and never throws when storage does; the close marks <html> at once
 *          and remembers it, even where storage refuses the write; the layout runs the script, the stylesheet hides the
 *          block under the same mark, and the block renders its close button for everyone, so the server and the
 *          browser agree.
 *          Filter: `bun test tests/ -t "How it works closes"`.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), the home page's polish after the UI overhaul
 *
 * The component is imported by a computed path, so the tests' typecheck does not follow it into the site's TSX.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { closeHow, HOW_ATTR, HOW_CLOSED, HOW_HEAD_SCRIPT, HOW_KEY } from "../../app/features/home/how-closed";

const site = (path: string) => `${import.meta.dir}/../../app/${path}`;

/** A storage holding `items`, or one whose every call throws (a private window, blocked site data). */
function storage(items: Record<string, string> | "throws") {
  const map = new Map(items === "throws" ? [] : Object.entries(items));
  const refuse = () => {
    throw new Error("SecurityError");
  };
  return {
    map,
    getItem: items === "throws" ? refuse : (key: string) => map.get(key) ?? null,
    setItem: items === "throws" ? refuse : (key: string, value: string) => void map.set(key, value),
  };
}

/** A document whose <html> records its attributes. */
function page() {
  const attrs = new Map<string, string>();
  return { attrs, documentElement: { setAttribute: (name: string, value: string) => void attrs.set(name, value) } };
}

/** Runs the head script against a fake storage and document, as the browser runs it before the first paint. */
function runHeadScript(items: Record<string, string> | "throws") {
  const doc = page();
  new Function("localStorage", "document", HOW_HEAD_SCRIPT)(storage(items), doc);
  return doc.attrs;
}

const globals = globalThis as { document?: unknown; window?: unknown };
afterEach(() => {
  delete globals.document;
  delete globals.window;
});

describe("How it works closes for good in this browser", () => {
  test("the head script marks <html> only when the stored value is the closed one", () => {
    expect(runHeadScript({ [HOW_KEY]: HOW_CLOSED }).get(HOW_ATTR)).toBe(HOW_CLOSED);
    expect(runHeadScript({}).has(HOW_ATTR)).toBe(false);
    expect(runHeadScript({ [HOW_KEY]: "open" }).has(HOW_ATTR)).toBe(false);
    expect(runHeadScript({ [HOW_KEY]: "Closed" }).has(HOW_ATTR)).toBe(false);
  });

  test("the head script leaves the block open, without throwing, when storage throws", () => {
    expect(runHeadScript("throws").has(HOW_ATTR)).toBe(false);
  });

  test("closing marks <html> at once and remembers it", () => {
    const doc = page();
    const local = storage({});
    globals.document = doc;
    globals.window = { localStorage: local };
    closeHow();
    expect(doc.attrs.get(HOW_ATTR)).toBe(HOW_CLOSED);
    expect(local.map.get(HOW_KEY)).toBe(HOW_CLOSED);
    // What was written is what the next visit's head script reads as closed.
    expect(runHeadScript(Object.fromEntries(local.map)).get(HOW_ATTR)).toBe(HOW_CLOSED);
  });

  test("closing still hides the block for this page when storage refuses the write", () => {
    const doc = page();
    globals.document = doc;
    globals.window = { localStorage: storage("throws") };
    expect(() => closeHow()).not.toThrow();
    expect(doc.attrs.get(HOW_ATTR)).toBe(HOW_CLOSED);
  });

  test("the layout runs the script in <head> and the stylesheet hides the block under the same mark", () => {
    const layout = readFileSync(site("app/layout.tsx"), "utf8");
    const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
    expect(head).toContain("__html: HOW_HEAD_SCRIPT");
    const css = readFileSync(site("styles/ui/cards.css"), "utf8");
    expect(css).toContain(`[${HOW_ATTR}="${HOW_CLOSED}"] .home-how-wrap { display: none; }`);
  });

  test("the block renders its close button for everyone, inside the part the mark hides", async () => {
    const react = await import(site("node_modules/react/index.js"));
    const server = await import(site("node_modules/react-dom/server.node.js"));
    const { HomeHow } = await import(site("features/home/home-how.tsx"));
    const { HOME } = await import(site("features/home/copy.ts"));
    const html: string = server.renderToStaticMarkup(react.createElement(HomeHow));
    expect(html.startsWith('<div class="home-how-wrap">')).toBe(true);
    expect(html).toContain(`aria-label="${HOME.howClose}"`);
    expect(html).toContain('type="button"');
    // Both sections close together: the steps and the principles sit inside the wrapper the mark hides.
    expect(html.indexOf("home-principles")).toBeGreaterThan(html.indexOf("home-steps"));
    expect(html.endsWith("</div>")).toBe(true);
  });
});
