/**
 * Purpose: "Report this campaign" on every campaign page (C-10, Sprint 13 DoD), in every state: a plain link to where
 *          reports go (no X script, widget or API, K-10), what the team can do (unlist it from the home page; the
 *          campaign stays on-chain, resolves and pays), and, for a campaign the team unlisted, that fact and its reason.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { REPORT_CAMPAIGN } from "./copy";
import type { Unlisted } from "./unlisted";

export function ReportCampaign({ id, unlisted }: { id: string; unlisted: Unlisted | null }) {
  return (
    <aside aria-label={REPORT_CAMPAIGN.link} className="space-y-1 text-xs text-muted" data-testid="report-campaign">
      {unlisted ? (
        <p className="m-0 text-warn">
          {REPORT_CAMPAIGN.unlisted} {REPORT_CAMPAIGN.reason(unlisted.reason)}
        </p>
      ) : null}
      <p className="m-0">
        <a
          href={REPORT_CAMPAIGN.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-soft hover:underline"
        >
          {REPORT_CAMPAIGN.link}
        </a>{" "}
        {REPORT_CAMPAIGN.where(id)}
      </p>
      <p className="m-0">{REPORT_CAMPAIGN.remedy}</p>
    </aside>
  );
}
