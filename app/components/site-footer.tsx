/**
 * Purpose: the footer of every screen, in the approved prototype's style (prototype-lab/campaigns, `.foot`): the links,
 *          then the legal lines the site must carry: BRAND.md's "not an offer" line (Sprint 13), the privacy page
 *          (answer 9a) and the age rule, with the program's explorer link, X and Discord. Baked may perch on it
 *          (data-perch).
 * Version: 0.1.1 (Discord beside X; 0.1.0, the UI overhaul: the footer lived in app/layout.tsx)
 * Sprint:  09 (site shell, theme and wallet)
 */
import Link from "next/link";

import { DISCORD_URL, X_URL } from "@/components/social-links";
import { BRAND } from "@/lib/brand";
import { programExplorerUrl } from "@/lib/brot";
import { PRIVACY_URL } from "@/lib/config";
import { AGE_NOTICE, NOT_AN_OFFER, PRIVACY_LABEL } from "./copy-site";

const LINKS = [
  { href: "/", label: "Campaigns" },
  { href: "/open", label: "Open a campaign" },
  { href: "/my-entries", label: "My entries" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/fees", label: "Fees" },
  { href: "/record", label: "Who can do what" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteFooter() {
  return (
    <footer
      className="foot"
      data-perch="footer"
      data-perch-x="0.9"
      data-perch-size="0.85"
      data-perch-pose="tired"
      data-perch-say={BRAND.footer}
    >
      <nav aria-label="Footer">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <a href={programExplorerUrl()} target="_blank" rel="noreferrer">
          Program
        </a>
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          {PRIVACY_LABEL}
        </a>
        <a href={X_URL} target="_blank" rel="noreferrer">
          X
        </a>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          Discord
        </a>
      </nav>
      <p>
        {BRAND.name} is in a test phase on Solana devnet, with test SOL. {NOT_AN_OFFER} {AGE_NOTICE}
      </p>
      <p className="mt-1.5">
        © 2026 {BRAND.name} · {BRAND.footer} · {BRAND.motto}
      </p>
    </footer>
  );
}
