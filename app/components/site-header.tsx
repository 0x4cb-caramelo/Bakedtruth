"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { CLUSTER, explorerAddress } from "@/lib/config";
import { shortAddress } from "@/lib/format";
import { useClock } from "@/lib/hooks";
import { PROGRAM_ID } from "@/lib/market";
import { CATEGORIES } from "@/lib/view";
import { Logo } from "@/components/primitives";
import { WalletButton } from "@/components/wallet-button";

/** Thin live strip: cluster, current slot and pace, program. */
export function StatusBar() {
  const clock = useClock();
  return (
    <div className="border-b border-line bg-page">
      <div className="mx-auto flex h-8 max-w-[1400px] items-center justify-between gap-4 px-4 text-[11px] text-dim sm:px-6">
        <span className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-yes opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-yes" />
          </span>
          <span className="font-medium text-yes">Live</span>
          <span className="capitalize">Solana {CLUSTER}</span>
          {clock && (
            <span className="hidden tabular-nums sm:inline">
              · slot {clock.slot.toLocaleString()} · {Math.round(clock.msPerSlot)} ms/slot
            </span>
          )}
        </span>
        <a
          href={explorerAddress(PROGRAM_ID.toBase58())}
          target="_blank"
          rel="noreferrer"
          className="hidden font-mono hover:text-muted sm:inline"
        >
          program {shortAddress(PROGRAM_ID.toBase58())} ↗
        </a>
      </div>
    </div>
  );
}

function SearchBox() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}#browse` : "/#browse");
      }}
      className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm focus-within:border-brand/60"
    >
      <Search className="size-4 shrink-0 text-dim" />
      <input
        ref={input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search markets, tokens, addresses"
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-dim"
        aria-label="Search markets"
      />
      <kbd className="hidden rounded-md border border-line px-1.5 text-[11px] text-dim sm:inline">/</kbd>
    </form>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] font-semibold tracking-wide text-muted lg:flex">
          <Link href="/" className="hover:text-ink">
            MARKETS
          </Link>
          <Link href="/?tab=activity#browse" className="hover:text-ink">
            ACTIVITY
          </Link>
          <Link href="/#how" className="hover:text-ink">
            HOW IT WORKS
          </Link>
        </nav>
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

/** Kalshi-style category row: Trending plus one entry per resolver family. */
export function CategoryNav() {
  const params = useSearchParams();
  const active = params.get("category");
  const item = (href: string, label: string, on: boolean) => (
    <Link
      key={label}
      href={href}
      className={`relative shrink-0 py-3 text-sm font-medium transition ${on ? "text-ink" : "text-muted hover:text-ink"}`}
    >
      {label}
      {on && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink" />}
    </Link>
  );
  return (
    <div className="border-b border-line">
      <nav className="no-scrollbar mx-auto flex max-w-[1400px] gap-6 overflow-x-auto px-4 sm:px-6">
        {item("/", "Trending", !active)}
        {CATEGORIES.map((c) => item(`/?category=${c.slug}#browse`, c.label, active === c.slug))}
      </nav>
    </div>
  );
}
