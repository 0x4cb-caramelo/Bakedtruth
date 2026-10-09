// Purpose: the pot as one bar, YES then NO then the prize as a hatched end cap that belongs to no side, with a legend
// and an accessible summary (.split). The caller passes the amounts as numbers of one unit and the labels already
// formatted, so this file knows nothing of SOL or of the pot's rules. Sprint -1 (the pot bar of the approved prototype).
type SplitBarProps = {
  yes: number;
  no: number;
  prize: number;
  summary: string;
  yesLabel: string;
  noLabel: string;
  prizeLabel?: string;
  thin?: boolean;
};

export function SplitBar({ yes, no, prize, summary, yesLabel, noLabel, prizeLabel, thin = false }: SplitBarProps) {
  const total = yes + no + prize || 1;
  const width = (x: number) => `${((x / total) * 100).toFixed(2)}%`;
  return (
    <div>
      <div role="img" aria-label={summary} className={`split ${thin ? "thin" : ""}`}>
        <span className="y" style={{ width: width(yes) }} />
        <span className="n" style={{ width: width(no) }} />
        <span className="p" style={{ width: width(prize) }} />
      </div>
      <div className="split-legend" aria-hidden="true">
        <span className="y">{yesLabel}</span>
        {prize > 0 && prizeLabel ? <span>{prizeLabel}</span> : null}
        <span className="n">{noLabel}</span>
      </div>
    </div>
  );
}
