// Purpose: the partner seal (BR-19) on a campaign opened free for a launch partner. It is a chip, not a band: the
// founder chose the chip on 2026-10-09 (L-24). Classes come from styles/ui.css (.chip.seal). Sprint -1.
export function Seal({ partner }: { partner: string }) {
  return (
    <span className="chip seal" title="Opened free by the Brot team for a launch partner">
      Launch partner · {partner}
    </span>
  );
}
