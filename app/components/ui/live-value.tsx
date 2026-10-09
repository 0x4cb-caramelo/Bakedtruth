// Purpose: the live reading against the target, the heart of the proof (P1 §4.7: the number read, the target and the
// link). Two big numbers: the reading now, and the target that makes YES. Classes come from styles/ui.css
// (.read-values). Sprint -1 (DESIGN-DIRECTION.md, "Prova").
export function LiveValue({
  field,
  now,
  target,
  direction,
}: {
  field: string;
  now: string | null;
  target: string;
  direction: "above" | "below";
}) {
  const dir = direction === "below" ? "at or below" : "at or above";
  return (
    <div className="read-values">
      <div>
        <small>{field} now</small>
        <b>{now ?? "No reading"}</b>
      </div>
      <div>
        <small>YES if {dir}</small>
        <b className="dim">{target}</b>
      </div>
    </div>
  );
}
