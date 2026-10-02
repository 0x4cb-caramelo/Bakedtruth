import Link from "next/link";
import { Target } from "lucide-react";

import { WalletButton } from "@/components/wallet-button";
import { CLUSTER } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-100">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300">
              <Target className="size-4.5" />
            </span>
            pred-provable
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 sm:flex">
            <Link href="/" className="hover:text-zinc-100">
              Markets
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-zinc-400 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {CLUSTER}
          </span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
