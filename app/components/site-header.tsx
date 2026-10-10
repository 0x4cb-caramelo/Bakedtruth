/**
 * Purpose: the site's top bar (Sprint 09): the brand, the routes (Sprint 13 adds "How it works" and the fees, so both
 *          open from a phone too), the theme button and the wallet button. The theme follows the stored choice after
 *          the first paint (the head script already set it, so there is no flash).
 * Version: 0.2.0 (Sprint 13: How it works, Fees)
 * Sprint:  09 (site shell, theme and wallet); 13
 */
"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { WalletButton } from "@/components/wallet-button";
import { BRAND } from "@/lib/brand";
import { applyTheme, type Theme } from "@/lib/theme";

const ROUTES = [
  { href: "/", label: "Campaigns" },
  { href: "/abrir", label: "Open" },
  { href: "/my-entries", label: "My entries" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/record", label: "Record" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/fees", label: "Fees" },
];

// The theme is whatever <html> carries: the head script sets it, and applyTheme changes it, so the observer keeps the
// button in step without any state of its own.
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const currentTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const serverTheme = (): Theme => "dark";

export function SiteHeader() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);
  const toggle = () => applyTheme(theme === "dark" ? "light" : "dark");
  return (
    <header className="border-b-2 border-line">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-bold text-ink">
          {BRAND.name}
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-4 text-sm text-dim">
          {ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="hover:text-ink">
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="rounded border-2 border-line px-3 py-1 text-sm text-ink"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
