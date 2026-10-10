/**
 * Purpose: the wallet's own entries, results and payouts at /my-entries (Sprint 12; the route name confirmed by the
 *          founder with L-01). The page reads the chain in the browser for the connected wallet.
 * Version: 0.2.0
 * Sprint:  09 (site shell, theme and wallet); 12 (content)
 */
import { MyEntries } from "@/features/my-entries/my-entries";

export default function Page() {
  return (
    <section className="py-2">
      <MyEntries />
    </section>
  );
}
