// Purpose: the progress bar of the proof panel (role=progressbar), on the token track. Sprint -1 (DESIGN-DIRECTION.md).
export function Progress({ value, label, height = 6 }: { value: number; label: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="w-full overflow-hidden rounded-(--r-pill) bg-(--track)"
      style={{ height }}
    >
      <div className="h-full rounded-(--r-pill) bg-(--fill)" style={{ width: `${pct}%` }} />
    </div>
  );
}
