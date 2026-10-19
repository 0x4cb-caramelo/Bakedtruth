/**
 * Purpose: the top bar's campaign search (the approved prototype's `.search`): what you type filters the home grid by
 *          title, asset, kind, address, creator or state (features/campaigns/arrange.ts), and typing anywhere else takes
 *          you home with the words kept. Nothing typed leaves the browser. On a phone the top bar's field hides and the
 *          menu's is the search (phone-menu.tsx).
 * Version: 0.1.0 (the UI overhaul)
 * Sprint:  09 (site shell); 10 (campaign list)
 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";

import { getQuery, serverQuery, setQuery, subscribeQuery } from "@/features/campaigns/search-store";

export function HeaderSearch({ id = "site-search", onDone }: { id?: string; onDone?: () => void }) {
  const query = useSyncExternalStore(subscribeQuery, getQuery, serverQuery);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <label className="search">
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (pathname !== "/") router.push("/");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") onDone?.();
        }}
        placeholder="Search campaigns, assets, addresses"
        aria-label="Search campaigns"
        autoComplete="off"
      />
    </label>
  );
}
