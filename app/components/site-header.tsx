"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { CATEGORIES } from "@/lib/view";
import { Logo } from "@/components/primitives";
import { WalletButton } from "@/components/wallet-button";

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
      className="flex h-10 w-64 items-center gap-2 border-2 border-line bg-page px-3 text-sm focus-within:border-brand"
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
      <kbd className="hidden border-2 border-line px-1 text-[11px] text-dim sm:inline">/</kbd>
    </form>
  );
}

/** Segmented category row: Trending plus one entry per resolver family. */
export function CategoryNav() {
  const params = useSearchParams();
  const active = params.get("category");
  const item = (href: string, label: string, on: boolean) => (
    <Link
      key={label}
      href={href}
      aria-current={on ? "page" : undefined}
      className={`shrink-0 border-l-2 border-line px-3 py-1.5 text-[13px] font-medium transition first:border-l-0 ${
        on ? "bg-brand font-bold text-page" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label="Market categories" className="no-scrollbar flex max-w-full overflow-x-auto border-2 border-line">
      {item("/", "Trending", !active)}
      {CATEGORIES.map((c) => item(`/?category=${c.slug}#browse`, c.label, active === c.slug))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-page">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="order-3 w-full lg:order-none lg:w-auto">
          <Suspense>
            <CategoryNav />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
