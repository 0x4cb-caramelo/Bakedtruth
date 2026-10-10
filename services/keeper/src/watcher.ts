/**
 * Purpose: the standby's continuous feed watcher. Every interval it lists the open campaigns, keeps the price ones
 *          (their sponsored feed moves between the primary's 60 s cycles, so the watcher checks them every few
 *          seconds), and tries the resolve task on each. It sends only while `mayResolve()` is true: the standby
 *          gate, which the lead's standby code decides. Overlapping ticks are skipped; errors are reported, never
 *          thrown, and the loop goes on.
 * Version: 0.1.0
 * Sprint:  07 (standby keeper and watchdog)
 */
import { ReaderKind } from "@brot/sdk/read";

import type { OpenCampaign } from "./campaigns";
import type { AttemptResult } from "./resolve";

export type WatcherOptions = {
  intervalMs: number;
  listOpen: () => Promise<OpenCampaign[]>;
  resolveOne: (open: OpenCampaign) => Promise<AttemptResult>;
  mayResolve: () => boolean;
  onAttempt?: (result: AttemptResult) => void;
  onError?: (detail: string) => void;
};

export type Watcher = { stop(): void; tick(): Promise<void>; ticks(): number };

/** Only price campaigns: the other four kinds are read by the primary's cycle, not by the watcher. */
export function priceCampaigns(open: OpenCampaign[]): OpenCampaign[] {
  return open.filter((item) => item.campaign.kind === ReaderKind.PriceTouch);
}

/** A tick waits while the previous one still runs, so two never overlap. */
export function shouldSkipTick(running: boolean): boolean {
  return running;
}

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function startWatcher(options: WatcherOptions): Watcher {
  let running = false;
  let stopped = false;
  let count = 0;

  const tick = async (): Promise<void> => {
    if (stopped || shouldSkipTick(running)) return;
    running = true;
    count++;
    try {
      const open = priceCampaigns(await options.listOpen());
      for (const item of open) {
        if (stopped || !options.mayResolve()) break;
        try {
          const result = await options.resolveOne(item);
          options.onAttempt?.(result);
        } catch (error) {
          options.onError?.(errorText(error));
        }
      }
    } catch (error) {
      options.onError?.(errorText(error));
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void tick(), options.intervalMs);
  return {
    stop() {
      stopped = true;
      clearInterval(timer);
    },
    tick,
    ticks: () => count,
  };
}
