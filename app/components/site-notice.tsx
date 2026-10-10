/**
 * Purpose: the two notices every screen shows (Sprint 09, BR-47, P1 §4.6), in English per the founder's L-01 decision:
 *          the test-money notice and the not-audited notice. Static text, no client state.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
export const TEST_NOTICE = "We are in testing. Here you enter with test SOL, which has no real value.";
export const AUDIT_NOTICE = "The program is not audited yet.";

export function SiteNotice() {
  return (
    <div role="note" className="border-b-2 border-line bg-surface px-4 py-2 text-center text-xs text-dim sm:px-6">
      <span>{TEST_NOTICE}</span> <span>{AUDIT_NOTICE}</span>
    </div>
  );
}
