/**
 * Purpose: the contrast of the design tokens (Sprint -1, DESIGN-DIRECTION.md). Reads app/styles/tokens.css, resolves
 *          every variable of the dark (:root) and the light (:root[data-theme="light"]) theme, and checks each text
 *          pair against WCAG 2.x: 4.5:1 for text, 3:1 for the borders of fields and controls. Needs no browser.
 * Version: 0.1.0
 * Sprint:  -1 (design system)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = readFileSync(join(import.meta.dir, "../../app/styles/tokens.css"), "utf8");

/** The declarations of one rule, by its selector line. */
function block(selector: string): Record<string, string> {
  const start = CSS.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no rule ${selector}`);
  const end = CSS.indexOf("}", start);
  const out: Record<string, string> = {};
  for (const m of CSS.slice(start, end).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const DARK = block(":root");
const LIGHT = { ...DARK, ...block(':root[data-theme="light"]') };

/** Resolves var(--x) references and returns a #rrggbb colour, or null for gradients and translucent values. */
function resolve(theme: Record<string, string>, name: string, depth = 0): [number, number, number] | null {
  const raw = theme[name];
  if (raw === undefined || depth > 8) throw new Error(`unknown token --${name}`);
  const ref = raw.match(/^var\(--([a-z0-9-]+)\)$/);
  if (ref) return resolve(theme, ref[1], depth + 1);
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return null;
  const digits = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
  const n = parseInt(digits, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Text pairs: foreground, background, and the minimum ratio (4.5 for text, 3 for non-text borders). */
const TEXT_ON_SURFACES = ["bg", "panel", "raised"];
const PAIRS: [string, string, number][] = [
  ...["text", "muted", "dim"].flatMap((fg) => TEXT_ON_SURFACES.map((bg): [string, string, number] => [fg, bg, 4.5])),
  ["on-accent", "cta-bg", 4.5],
  ["on-accent", "cta-hover", 4.5],
  ["accent-soft", "panel", 4.5],
  ["yes-fg", "yes-bg", 4.5],
  ["no-fg", "no-bg", 4.5],
  ["warn", "panel", 4.5],
  ["error", "panel", 4.5],
  ["error", "danger-bg", 4.5],
  ["note-fg", "note-bg", 4.5],
  ["notice-bg", "text", 4.5],
  ["pressed-fg", "pressed-bg", 4.5],
  ["crust-ink", "bg", 4.5],
  ["crust-ink", "strip-bg", 4.5],
  ["crust-ink", "panel", 4.5],
  ...["open", "closed", "review", "paid", "void", "contest"].map((s): [string, string, number] => [
    `st-${s}-fg`,
    `st-${s}-bg`,
    4.5,
  ]),
  ...["price", "burn", "lock", "pool", "stake"].map((k): [string, string, number] => [`k-${k}-fg`, `k-${k}-bg`, 4.5]),
  ["field-line", "bg", 3],
  ["field-line", "panel", 3],
];

describe("design tokens meet contrast", () => {
  for (const [theme, name] of [
    [DARK, "dark"],
    [LIGHT, "light"],
  ] as const) {
    test(`${name} theme: every text pair is at least its minimum`, () => {
      const failures: string[] = [];
      let checked = 0;
      for (const [fg, bg, min] of PAIRS) {
        const a = resolve(theme, fg);
        const b = resolve(theme, bg);
        if (!a || !b) throw new Error(`${fg} on ${bg} is not a plain colour in ${name}`);
        checked++;
        const ratio = contrast(a, b);
        if (ratio < min) failures.push(`${fg} on ${bg}: ${ratio.toFixed(2)}:1 (needs ${min})`);
      }
      expect(checked).toBe(PAIRS.length);
      expect(failures).toEqual([]);
    });
  }
});
