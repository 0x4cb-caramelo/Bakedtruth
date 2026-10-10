/**
 * Purpose: the home route (Sprint 10): the campaign list from the read API, with the search, the filters, the sort and
 *          the cards. Lucas's screens and the campaign page (Sprint 11) are separate routes.
 * Version: 0.4.0
 * Sprint:  10 (site: campaign list)
 */
import { CampaignList } from "@/features/campaigns/campaign-list";

export default function Home() {
  return (
    <section className="py-6">
      <h1 className="mb-4 text-3xl font-bold text-ink">Campaigns</h1>
      <CampaignList />
    </section>
  );
}
