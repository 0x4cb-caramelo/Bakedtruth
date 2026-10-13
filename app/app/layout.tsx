/**
 * Purpose: the site's root layout (Sprint 09), in the approved prototype's frame (prototype-lab/campaigns): the two fonts
 *          the site serves itself, the theme script in <head> before the stylesheet, the skip link, the devnet strip,
 *          the sticky top bar, the page and the footer (site-footer.tsx: not an offer, the privacy page, the age rule),
 *          over the prototype's dot field (pointer-effects.tsx). Providers wrap the page; the wallet is registered once
 *          in them, and Baked is mounted once. The reviewed names of graduation curves (content/account-names.json)
 *          are read here, on the server, so every page's titles name a reviewed curve at once (curve-names.tsx).
 * Version: 0.3.2 (the reviewed curve names; 0.3.1, the UI overhaul: the dot field and the spotlight; 0.3.0, the
 *          prototype's frame; 0.2.3, the privacy link and the age rule)
 * Sprint:  09 (site shell, theme and wallet); the sixth kind's site
 */
import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { fontClassName } from "@/lib/fonts";
import { THEME_HEAD_SCRIPT } from "@/lib/theme";
import { Mascot } from "@/components/mascot";
import { PointerEffects } from "@/components/pointer-effects";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNotice } from "@/components/site-notice";
import { loadNames, type KnownName } from "@/features/open-campaign/names";

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: `${BRAND.tagline}, on Solana devnet with test SOL. ${BRAND.motto}`,
};

/** The reviewed curve names; a file that cannot be read leaves every curve named by its ticker, and is logged. */
function curveNames(): KnownName[] {
  try {
    return loadNames().filter((n) => n.kind === "curve");
  } catch (error) {
    console.error(`layout: the reviewed names could not be read (${error instanceof Error ? error.message : "Error"})`);
    return [];
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={fontClassName} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
      </head>
      <body>
        <Providers curveNames={curveNames()}>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <PointerEffects />
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
