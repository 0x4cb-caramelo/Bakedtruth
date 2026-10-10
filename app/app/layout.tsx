/**
 * Purpose: the site's root layout (Sprint 09): the two fonts the site serves itself, the theme script in <head> before
 *          the stylesheet, the notice, the top bar, the page and the footer. Providers wrap the page; the wallet is
 *          registered once in them.
 * Version: 0.2.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { programExplorerUrl } from "@/lib/brot";
import { fontClassName } from "@/lib/fonts";
import { THEME_HEAD_SCRIPT } from "@/lib/theme";
import { Mascot } from "@/components/mascot";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteNotice } from "@/components/site-notice";

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: `${BRAND.tagline}. ${BRAND.motto}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${fontClassName} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col">
            <SiteNotice />
            <SiteHeader />
            <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6">{children}</main>
            <footer className="mt-16 border-t-2 border-line">
              <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-dim sm:px-6">
                <span>{BRAND.name} · devnet · not audited, do not use with real funds</span>
                <a href={programExplorerUrl()} target="_blank" rel="noreferrer" className="underline">
                  Program
                </a>
                <span>{BRAND.motto}</span>
              </div>
            </footer>
          </div>
          <Mascot />
        </Providers>
      </body>
    </html>
  );
}
