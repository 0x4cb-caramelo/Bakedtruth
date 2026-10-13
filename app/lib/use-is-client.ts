/**
 * Purpose: whether this render is in the browser, false on the server and while the page hydrates, so a value that
 *          exists only in the browser never makes the first render differ from the server's HTML. The creation box
 *          writes local times with it (the Sprint 19 adversarial review, L12: the server's HTML never carries the
 *          server's zone), and the wallet hook waits for it before saying no wallet is installed. Read through
 *          useSyncExternalStore, so no effect sets state.
 * Version: 0.1.1 (moved from features/open-campaign, shared with the wallet hook)
 * Sprint:  19 (site: open a campaign); the hydration fix after the 2026-10-13 release
 */
import { useSyncExternalStore } from "react";

const never = () => () => undefined;

export const useIsClient = () =>
  useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
