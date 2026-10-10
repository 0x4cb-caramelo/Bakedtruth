/**
 * Purpose: the home route (Sprint 10): the campaign list from the read API, with the search, the filters, the sort and
 *          the cards. Since Sprint 13 the campaigns the team unlisted after a report (content/unlisted.json, read here on
 *          the server when the site is built) are hidden like any unlisted one, until "Show unlisted".
 * Version: 0.5.0
 * Sprint:  10 (site: campaign list); 13
 */
import { CampaignList } from "@/features/campaigns/campaign-list";
import { loadUnlisted } from "@/features/report/unlisted";

export default function Home() {
  return (
    <section className="py-6">
      <h1 className="mb-4 text-3xl font-bold text-ink">Campaigns</h1>
      <CampaignList unlisted={loadUnlisted().map((u) => ({ id: u.id, opensAt: u.opensAt }))} />
    </section>
  );
}
