import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow_Condensed, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/components/chat/chat";
import { Providers } from "@/components/providers";
import { CategoryNav, SiteHeader, StatusBar } from "@/components/site-header";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Provable · KPI markets on Solana",
  description: "Bounties on on-chain goals. Resolution is a read, not a judgement.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <ChatProvider>
            <StatusBar />
            <SiteHeader />
            <Suspense>
              <CategoryNav />
            </Suspense>
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">{children}</main>
            <footer className="border-t border-line">
              <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-dim sm:px-6">
                <span>Provable KPI markets · Solana devnet · not audited, do not use with real funds</span>
                <span>Resolution is a read, not a judgement.</span>
              </div>
            </footer>
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
