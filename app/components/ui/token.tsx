// Purpose: the one-letter token tile of a campaign's kind (P1 §4.2). Five kinds, each with its own tile colour, none
// of them YES/NO green or red. Sprint -1 (DESIGN-DIRECTION.md, "Token").
export type TokenKind = "price" | "burn" | "lock" | "pool" | "stake";

export function Token({ kind, letter, size = 40 }: { kind: TokenKind; letter: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-(--r-sm) font-display font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: `var(--k-${kind}-bg)`,
        color: `var(--k-${kind}-fg)`,
      }}
    >
      {letter}
    </span>
  );
}
