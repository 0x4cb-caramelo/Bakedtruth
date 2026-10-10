/**
 * Purpose: the public record at /record (Sprint 12; the route name confirmed by the founder with L-01): the team's
 *          voids and corrections from content/void-log/, read on the server when the site is built. A new record
 *          appears once it is committed (with two people's review) and the site is built again.
 * Version: 0.2.0
 * Sprint:  09 (site shell, theme and wallet); 12 (content)
 */
import { RecordList } from "@/features/record/record-list";
import { loadVoidLog } from "@/features/record/load-void-log";

export default function Page() {
  return (
    <section className="py-2">
      <RecordList log={loadVoidLog()} />
    </section>
  );
}
