/**
 * Purpose: the site's colours are the brand's (docs/product/BRAND.md §5; ported 2026-10-10): every token BRAND.md gives
 *          a plain colour in both themes has that value in app/styles/tokens.css, but for the few the site keeps apart
 *          on purpose (DESIGN-DIRECTION.md, "Cores"); no blue of the earlier palette is back, but the pointer's light
 *          in dark (2026-10-19); and every text pair reads at 4.5:1 and every field border and bar at 3:1 (WCAG 2.x), in both themes.
 *          Filter: `bun test tests/ -t "site colours follow the brand"`.
 * Version: 0.1.0
 * Sprint:  out of band (the brand's colours, 2026-10-10)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const root = `${import.meta.dir}/../..`;
const css = readFileSync(`${root}/app/styles/tokens.css`, "utf8");
const brand = readFileSync(`${root}/docs/product/BRAND.md`, "utf8");

/** One block's declarations (`:root {` or `:root[data-theme="light"] {`), name to value. */
function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("\n}", start));
  return new Map([...body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
const THEMES = { dark: block(":root"), light: new Map([...block(":root"), ...block(':root[data-theme="light"]')]) };
type Theme = keyof typeof THEMES;

/** A token's colour as a 6-digit hex, through `var(--x)` references; null for gradients and alpha colours. */
function hex(theme: Theme, name: string): string | null {
  const value = THEMES[theme].get(name);
  if (!value) throw new Error(`${theme} has no ${name}`);
  const ref = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (ref) return hex(theme, ref[1]);
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}

const channels = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
function luminance(h: string): number {
  const [r, g, b] = channels(h).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
/** The interface blues of the earlier palette: hue 195° to 240° at saturation 0.5 or more (navy and slate pass). */
function isBlue(h: string): boolean {
  const [r, g, b] = channels(h);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min || max !== b) return false;
  const light = (max + min) / 2;
  const saturation = (max - min) / (light > 0.5 ? 2 - max - min : max + min);
  const hue = 60 * ((r - g) / (max - min)) + 240;
  return hue >= 195 && hue <= 240 && saturation >= 0.5;
}

const SURFACES = ["--bg", "--panel", "--raised"];
const TEXT: [string, string][] = [
  ...["--text", "--muted", "--dim", "--accent", "--accent-soft", "--crust-ink", "--warn", "--error"].flatMap((fg) =>
    SURFACES.map((bg) => [fg, bg] as [string, string]),
  ),
  ["--text", "--notice-bg"],
  ["--muted", "--notice-bg"],
  ["--dim", "--notice-bg"],
  ["--text", "--danger-bg"],
  ["--on-accent", "--accent"],
  ["--on-accent", "--cta-bg"],
  ["--on-accent", "--cta-hover"],
  ["--accent-hover", "--bg"],
  ["--error", "--danger-bg"],
  ["--yes-fg", "--yes-bg"],
  ["--no-fg", "--no-bg"],
  ["--strip-fg", "--strip-bg"],
  ["--say-fg", "--say-bg"],
  ...["open", "closed", "review", "contest", "paid", "void"].map(
    (s) => [`--st-${s}-fg`, `--st-${s}-bg`] as [string, string],
  ),
  ...["price", "burn", "lock", "pool", "stake"].map((k) => [`--k-${k}-fg`, `--k-${k}-bg`] as [string, string]),
];
const UI: [string, string][] = [
  ["--field-line", "--panel"],
  ["--field-line", "--bg"],
  ["--yes-bar", "--track"],
  ["--no-bar", "--track"],
  ["--yes-bar", "--panel"],
  ["--no-bar", "--panel"],
];
/** Where the site keeps apart from BRAND.md on purpose, and why (DESIGN-DIRECTION.md, "Cores"). */
const APART: Record<string, Theme[]> = {
  "--raised": ["dark"], // one step above a panel; the brand's equals the panel
  "--notice-bg": ["dark"], // the brand's is YES's green; here it backs info boxes and the leaderboard's "You" row
  "--ic-bg": ["light"], // BRAND.md writes "#a8481b at 12%"; the token is #a8481b1f
};
/** The one blue allowed back: the pointer's light in dark (the cards' spotlight edge), Ronaldo's choice of 2026-10-19. */
const POINTER_LIGHT: Record<string, Theme[]> = { "--spot-edge": ["dark"] };

describe("site colours follow the brand", () => {
  test("every token BRAND.md gives a plain colour has its value, in both themes, but the ones kept apart", () => {
    const rows = [
      ...brand.matchAll(/^\|[^|]*\|\s*`(--[a-z-]+)`\s*\|\s*`(#[0-9a-f]{6})`[^|]*\|\s*`(#[0-9a-f]{6})`[^|]*\|\s*$/gm),
    ];
    expect(rows.length).toBeGreaterThanOrEqual(20);
    for (const [, name, dark, light] of rows) {
      if (!THEMES.dark.has(name)) continue; // a token of the landing page only (the "we are baking" notice)
      if (!APART[name]?.includes("dark")) expect(`${name} dark ${hex("dark", name)}`).toBe(`${name} dark ${dark}`);
      if (!APART[name]?.includes("light")) expect(`${name} light ${hex("light", name)}`).toBe(`${name} light ${light}`);
    }
  });

  test("no blue of the earlier palette is back", () => {
    for (const theme of ["dark", "light"] as const)
      for (const name of THEMES[theme].keys()) {
        const value = hex(theme, name);
        if (value && !POINTER_LIGHT[name]?.includes(theme))
          expect(`${theme} ${name} ${value} blue: ${isBlue(value)}`).toBe(`${theme} ${name} ${value} blue: false`);
      }
    expect(css).not.toMatch(/#4f7dff|#2f5fe6|#a8beff/i);
  });

  test("text reads at 4.5:1, field borders and bars at 3:1, in both themes", () => {
    for (const theme of ["dark", "light"] as const) {
      for (const [pairs, need] of [
        [TEXT, 4.5],
        [UI, 3],
      ] as const)
        for (const [fg, bg] of pairs) {
          const ratio = contrast(hex(theme, fg)!, hex(theme, bg)!);
          expect(`${theme} ${fg} on ${bg}: ${ratio >= need}`).toBe(`${theme} ${fg} on ${bg}: true`);
        }
    }
  });
});
