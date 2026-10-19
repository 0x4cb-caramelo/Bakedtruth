/**
 * Purpose: the site's top bar, in the approved prototype's layout (prototype-lab/campaigns, `.top`): the loaf and the
 *          wordmark (the loaf is brot.markets' own, services/landing's img/brot-loaf.webp, at its size), the three main
 *          links with the current one underlined, the campaign search (on a phone it is in the menu only),
 *          "Open a campaign", the theme switch, the wallet and, under 1180 px, the menu with every route
 *          (phone-menu.tsx). It sticks to the top and draws its edge once the page scrolls. The theme follows the stored
 *          choice after the first paint (the head script already set it, so there is no flash).
 * Version: 0.3.2 (no search button on a phone: the menu carries the search; 0.3.1, brot.markets' loaf)
 * Sprint:  09 (site shell, theme and wallet); 13
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Menu, Moon, Plus, Sun } from "lucide-react";

import { HeaderSearch } from "@/components/header-search";
import { PhoneMenu } from "@/components/phone-menu";
import { cx } from "@/components/ui/cx";
import { WalletButton } from "@/components/wallet-button";
import { asset } from "@/lib/base-path";
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
  const [menu, setMenu] = useState(false);
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
        {/* eslint-disable-next-line @next/next/no-img-element -- brot.markets' 58 px loaf, already sized */}
        <img src={asset("/img/brot-loaf.webp")} alt="" width={58} height={35} />
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
        <Link className="cta open-link" href="/open">
          <span>
            <Plus className="size-4" aria-hidden="true" />
            Open a campaign
          </span>
        </Link>
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
          onClick={() => setMenu(true)}
        >
          <Menu className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
      <PhoneMenu open={menu} onClose={() => setMenu(false)} theme={theme} onTheme={toggle} />
    </header>
  );
}
