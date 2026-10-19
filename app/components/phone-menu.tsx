/**
 * Purpose: the menu under 1180 px (the approved prototype's `.phone-nav` sheet): the campaign search (the top bar's
 *          field hides on a phone), every route, the theme switch and the privacy page, in a dialog that closes on a
 *          choice, on Escape or on its close button. Its links form the "Main" navigation while it is open, as the
 *          top bar's do on a wide screen.
 * Version: 0.1.0 (the UI overhaul)
 * Sprint:  09 (site shell, theme and wallet)
 */
"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";

import { HeaderSearch } from "@/components/header-search";
import { Dialog } from "@/components/ui/dialog";
import { PRIVACY_URL } from "@/lib/config";
import type { Theme } from "@/lib/theme";
import { PRIVACY_LABEL } from "./copy-site";

export const ROUTES = [
  { href: "/", label: "Campaigns" },
  { href: "/open", label: "Open a campaign" },
  { href: "/my-entries", label: "My entries" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/record", label: "Who can do what" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/fees", label: "Fees" },
] as const;

export function PhoneMenu(props: { open: boolean; onClose: () => void; theme: Theme; onTheme: () => void }) {
  return (
    <Dialog open={props.open} title="Menu" onClose={props.onClose}>
      <div className="mb-3 [&_.search]:max-w-none">
        <HeaderSearch id="menu-search" onDone={props.onClose} />
      </div>
      <nav className="phone-nav" aria-label="Main">
        {ROUTES.map((route) => (
          <Link key={route.href} href={route.href} onClick={props.onClose}>
            {route.label}
          </Link>
        ))}
        <hr />
        <button type="button" onClick={props.onTheme}>
          {props.theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          {props.theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          {PRIVACY_LABEL}
        </a>
      </nav>
    </Dialog>
  );
}
