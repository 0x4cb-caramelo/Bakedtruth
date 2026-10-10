/**
 * Purpose: the two notices every screen shows (Sprint 09, BR-47, P1 §4.6), in English per the founder's L-01 decision:
 *          the test-money notice and the not-audited notice, which links to who can do what (their words are
 *          copy-site.ts). Static text, no client state.
 * Version: 0.1.2 (Sprint 13: the record link)
 * Sprint:  09 (site shell, theme and wallet)
 */
import { AUDIT_LINK, AUDIT_NOTICE, TEST_NOTICE } from "./copy-site";

export { AUDIT_NOTICE, TEST_NOTICE };

export function SiteNotice() {
  return (
    <div role="note" className="border-b-2 border-line bg-surface px-4 py-2 text-center text-xs text-dim sm:px-6">
      <span>{TEST_NOTICE}</span> <span>{AUDIT_NOTICE}</span>{" "}
      <a href="/record" className="underline">
        {AUDIT_LINK}
      </a>
    </div>
  );
}
