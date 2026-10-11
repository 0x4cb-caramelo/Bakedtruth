/**
 * Purpose: the site's root layout (Sprint 09), in the approved prototype's frame (prototype-lab/campaigns): the two fonts
 *          the site serves itself, the theme script in <head> before the stylesheet, the skip link, the devnet strip,
 *          the sticky top bar, the page and the footer (site-footer.tsx: not an offer, the privacy page, the age rule).
 *          Providers wrap the page; the wallet is registered once in them, and Baked is mounted once.
 * Version: 0.3.0 (the UI overhaul: the prototype's frame; 0.2.3, the privacy link and the age rule)
 * Sprint:  09 (site shell, theme and wallet)
 */
import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { fontClassName } from "@/lib/fonts";
import { THEME_HEAD_SCRIPT } from "@/lib/theme";
import { Mascot } from "@/components/mascot";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNotice } from "@/components/site-notice";

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: `${BRAND.tagline}, on Solana devnet with test SOL. ${BRAND.motto}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={fontClassName} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <SiteNotice />
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <Mascot />
        </Providers>
      </body>
    </html>
  );
}
