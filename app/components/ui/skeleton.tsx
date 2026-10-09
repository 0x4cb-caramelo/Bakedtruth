// Purpose: a loading block that shimmers, and stops for reduced motion (.skel in styles/ui.css). It is hidden from
// screen readers; the screen says "loading" in text. Sprint -1 (DESIGN-DIRECTION.md, "Carregando").
export function Skeleton({ height = 16, width = "100%" }: { height?: number; width?: string | number }) {
  return <div aria-hidden="true" className="skel" style={{ height, width }} />;
}
