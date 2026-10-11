/**
 * Purpose: the site's top bar, in the approved prototype's layout (prototype-lab/campaigns, `.top`): Baked and the
 *          wordmark, the three main links with the current one underlined, the campaign search, "Open a campaign",
 *          the theme switch, the wallet and, under 1180 px, the menu with every route (phone-menu.tsx). It sticks to the
 *          top and draws its edge once the page scrolls. The theme follows the stored choice after the first paint
 *          (the head script already set it, so there is no flash).
 * Version: 0.3.0 (the UI overhaul: the prototype's bar; 0.2.1, Sprint 13's routes)
 * Sprint:  09 (site shell, theme and wallet); 13
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, Moon, Plus, Search, Sun } from "lucide-react";

import { HeaderSearch } from "@/components/header-search";
import { PhoneMenu } from "@/components/phone-menu";
import { cx } from "@/components/ui/cx";
import { WalletButton } from "@/components/wallet-button";
import { applyTheme, type Theme } from "@/lib/theme";

const MAIN = [
  { href: "/", label: "Campaigns" },
  { href: "/my-entries", label: "My entries" },
  { href: "/how-it-works", label: "How it works" },
] as const;

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
  const pathname = usePathname();
  const [menu, setMenu] = useState<null | "menu" | "search">(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={cx("top", scrolled && "scrolled")}>
      <Link className="brand" href="/" aria-label="Brot Markets, home">
        {/* eslint-disable-next-line @next/next/no-img-element -- a 52 px sprite of Baked, already sized */}
        <img src="/mascot/deadpan.png" alt="" width={52} height={33} />
        <span>
          brot<b className="tld">.markets</b>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Main">
        {MAIN.map((link) => (
          <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>
      <HeaderSearch />
      <div className="top-actions">
        <Link className="btn open-link" href="/abrir">
          <Plus className="size-4" aria-hidden="true" />
          Open a campaign
        </Link>
        <button className="icon-btn search-btn" type="button" aria-label="Search campaigns" onClick={() => setMenu("search")}>
          <Search className="size-[18px]" aria-hidden="true" />
        </button>
        <button
          className="icon-btn theme"
          type="button"
          onClick={toggle}
          aria-label={`Switch to the ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {/* chrome.css shows the sun in dark and the moon in light, so the first paint is already right. */}
          <Moon className="moon size-4" aria-hidden="true" />
          <Sun className="sun size-4" aria-hidden="true" />
        </button>
        <div className="wallet">
          <WalletButton />
        </div>
        <button
          className="icon-btn menu-btn"
          type="button"
          aria-label="Menu"
          aria-haspopup="dialog"
          onClick={() => setMenu("menu")}
        >
          <Menu className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
      <PhoneMenu
        open={menu !== null}
        focusSearch={menu === "search"}
        onClose={() => setMenu(null)}
        theme={theme}
        onTheme={toggle}
      />
    </header>
  );
}
