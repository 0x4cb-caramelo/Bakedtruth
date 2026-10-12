/**
 * Purpose: the home route (Sprint 10), in the approved prototype's layout since the UI overhaul (features/home): the top
 *          line, the "Open now" carousel with "Closing soon" and "Answered recently", how it works, and the grid of
 *          campaigns from the read API. Since Sprint 13 the campaigns the team unlisted after a report
 *          (content/unlisted.json, read here on the server when the site is built) count as unlisted everywhere on it.
 * Version: 0.6.0 (the UI overhaul)
 * Sprint:  10 (site: campaign list); 13
 */
import { HomePage } from "@/features/home/home-page";
import { loadUnlisted } from "@/features/report/unlisted";

export default function Home() {
  return <HomePage unlisted={loadUnlisted().map((u) => ({ id: u.id, opensAt: u.opensAt }))} />;
}
