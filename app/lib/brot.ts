/**
 * Purpose: the site's one door to the Brot Markets SDK (Sprint 09, A-6): the read half (constants, PDAs, decoding, public
 *          state) and the tx half (the transaction builders and the summary). Components import from here, never from a
 *          copy of the program's rules, and never from the SDK's internal paths.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
export * from "@brot/sdk/read";
export * as tx from "@brot/sdk/tx";

import { PROGRAM_ID } from "@brot/sdk/read";

import { explorerAddress } from "@/lib/config";

/** The program's explorer link for the cluster the site runs on. */
export const programExplorerUrl = (): string => explorerAddress(PROGRAM_ID.toString());
