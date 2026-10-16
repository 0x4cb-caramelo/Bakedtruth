/**
 * Purpose: a countdown on screen from the chain's time (A-7): the seconds left when the page last read the chain,
 *          counted down each second between reads, never below zero. Each new read restarts it from the chain's figure,
 *          so the computer's own clock only ever measures the seconds since that read. Shared by the review clock
 *          (state-panel.tsx) and the deadline in the rule's line (rule-line.tsx).
 * Version: 0.1.0 (out of state-panel.tsx, for its second use)
 * Sprint:  12 (site: my entries and campaign states); the campaign page's polish
 */
"use client";

import { useEffect, useState } from "react";

/** The seconds left at the chain time read, counted down on screen between reads. */
export function useCountdown(atRead: bigint): bigint {
  const [left, setLeft] = useState(atRead);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const passed = BigInt(Math.floor((Date.now() - started) / 1000));
      setLeft(atRead > passed ? atRead - passed : 0n);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [atRead]);
  return left;
}
