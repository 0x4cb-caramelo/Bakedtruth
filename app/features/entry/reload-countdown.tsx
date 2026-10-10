/**
 * Purpose: A-8 on screen: under the "program updated" failure, the seconds left before the page reloads (the back-off
 *          of upgrade-pause.ts); at zero the page reloads. The failure's title is what screen readers hear: the count
 *          is not announced every second. Closing the sheet stops the countdown, and the next review checks again.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8)
 */
"use client";

import { useEffect, useState } from "react";

import { RELOADING } from "./copy-failures";
import { reloadDelay, reloadForUpgrade, sessionCount } from "./upgrade-pause";

/** Seconds left before the reload; the page reloads when it reaches zero. */
function useReloadCountdown(): number {
  const [left, setLeft] = useState(() => reloadDelay(sessionCount()));
  useEffect(() => {
    const store = sessionCount();
    const until = Date.now() + reloadDelay(store) * 1000;
    const timer = window.setInterval(() => {
      const rest = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setLeft(rest);
      if (rest > 0) return;
      window.clearInterval(timer);
      reloadForUpgrade(store);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return left;
}

export function ReloadCountdown() {
  const left = useReloadCountdown();
  return <p className="m-0 text-muted">{RELOADING(left)}</p>;
}
