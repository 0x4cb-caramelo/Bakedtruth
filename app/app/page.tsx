/**
 * Purpose: the home route (Sprint 09 shell): the campaign list comes in Sprint 10. Until then it shows the read API's
 *          status, so the wiring to /api/v1 is visible.
 * Version: 0.3.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import { ApiStatus } from "@/components/api-status";

export default function Home() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold text-ink">Campaigns</h1>
      <p className="mt-3 text-dim">The campaign list arrives in Sprint 10.</p>
      <div className="mt-6">
        <ApiStatus />
      </div>
    </section>
  );
}
