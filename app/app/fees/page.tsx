/**
 * Purpose: the fee page at /fees (Sprint 13; BR-32): what Brot keeps, what the creator gets, a worked example net of
 *          the fee and the creator share, the one-sided pot, the void, the opening's 90/10 and the refund policy.
 *          Static: drawn when the site is built.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { Metadata } from "next";

import { FeePage } from "@/features/fees/fee-page";

export const metadata: Metadata = { title: "Fees · Brot Markets" };

export default function Page() {
  return (
    <section className="py-2">
      <FeePage />
    </section>
  );
}
