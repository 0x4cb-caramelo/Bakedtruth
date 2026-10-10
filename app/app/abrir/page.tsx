/**
 * Purpose: The creation route (the creation box, Sprint 19). A shell for Sprint 09: the route exists and says, in the
 *          fee page's words, that opening from the site is not there yet (Sprint 13's copy review).
 * Version: 0.1.1
 * Sprint:  09 (site shell, theme and wallet); 13 (the wording)
 */
import { FEES } from "@/features/fees/copy";

export default function Page() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold text-ink">Open a campaign</h1>
      <p className="mt-3 text-dim">{FEES.openingSite}</p>
    </section>
  );
}
