import type { Metadata } from "next";
import { Geist_Mono, Jersey_15, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { CellField } from "@/components/cell-field";
import { Mascot } from "@/components/mascot";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { TapeProvider } from "@/components/tape-context";
import { Ticker } from "@/components/ticker";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const jersey = Jersey_15({ variable: "--font-jersey", subsets: ["latin"], weight: "400" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: `Bounties on on-chain goals. ${BRAND.motto}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jersey.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>
          <CellField />
          <TapeProvider>
            <div className="relative z-10 flex min-h-screen flex-col">
              <Ticker />
              <SiteHeader />
              <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6">{children}</main>
              <footer
                className="mt-16 border-t-2 border-line"
                data-perch="foot"
                data-perch-pose="tired"
                data-perch-say="Not audited. Stay sharp."
              >
                <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-dim sm:px-6">
                  <span>
                    {BRAND.name} · {BRAND.tagline} · devnet · not audited, do not use with real funds
                  </span>
                  <span>{BRAND.motto}</span>
                </div>
              </footer>
            </div>
          </TapeProvider>
          <Mascot />
        </Providers>
      </body>
    </html>
  );
}
