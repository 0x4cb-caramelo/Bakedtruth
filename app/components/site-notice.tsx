/**
 * Purpose: the strip above every screen (Sprint 09, BR-47, P1 §4.6), in the approved prototype's place and style
 *          (prototype-lab/campaigns, `.status`): the devnet mark, the test-money notice and the not-audited notice,
 *          whose words are copy-site.ts, and the link to who can do what. The full words at every width: a phone wraps
 *          them rather than shortening what the notices promise. Static text, no client state.
 * Version: 0.2.0 (the UI overhaul: the prototype's strip; 0.1.2, Sprint 13's record link)
 * Sprint:  09 (site shell, theme and wallet)
 */
import Link from "next/link";

import { AUDIT_LINK, AUDIT_NOTICE, TEST_NOTICE } from "./copy-site";

export { AUDIT_NOTICE, TEST_NOTICE };

export function SiteNotice() {
  return (
    <div className="status" role="note">
      <span>
        <b>● Solana devnet</b> · {TEST_NOTICE} {AUDIT_NOTICE}
      </span>
      <Link href="/record" className="shrink-0 underline underline-offset-2 [color:inherit]">
        {AUDIT_LINK}
      </Link>
    </div>
  );
}
