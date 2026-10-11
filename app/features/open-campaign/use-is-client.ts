/**
 * Purpose: whether this render is in the browser (the Sprint 19 adversarial review, L12): the visitor's own time zone
 *          exists only there, so the creation box writes local times after hydration and the server's HTML never
 *          carries the server's zone. Read through useSyncExternalStore, so no effect sets state.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { useSyncExternalStore } from "react";

const never = () => () => undefined;

export const useIsClient = () =>
  useSyncExternalStore(
    never,
    () => true,
    () => false,
  );
