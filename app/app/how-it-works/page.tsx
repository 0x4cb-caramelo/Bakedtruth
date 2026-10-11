/**
 * Purpose: "How it works" at /how-it-works (Sprint 13; spec 3.2 and 3.15 of Sprint -1): the six steps of a campaign as
 *          one path that opens the same on a phone, then what they mean for a baker's SOL. Static: drawn when the site
 *          is built.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { Metadata } from "next";

import { HowPage } from "@/features/how/how-page";

export const metadata: Metadata = { title: "How it works · Brot Markets" };

export default function Page() {
  return (
    <section className="py-2">
      <HowPage />
    </section>
  );
}
