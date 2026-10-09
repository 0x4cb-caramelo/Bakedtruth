// Purpose: the one-letter tile of a campaign's kind (P1 §4.2), in the kind's own colour (.kind-tile). Five kinds, none
// of them YES/NO green or red; the kind's name always sits next to the tile. Sprint -1 (DESIGN-DIRECTION.md, "Token").
export type TokenKind = "price" | "burn" | "lock" | "pool" | "stake";

const LETTERS: Record<TokenKind, string> = { price: "$", burn: "B", lock: "L", pool: "P", stake: "V" };

export function Token({ kind, small = false }: { kind: TokenKind; small?: boolean }) {
  return (
    <span aria-hidden="true" className={`kind-tile kind-${kind} ${small ? "sm" : ""}`}>
      {LETTERS[kind]}
    </span>
  );
}
