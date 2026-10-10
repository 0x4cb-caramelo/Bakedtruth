/**
 * Purpose: the browser's one Kit RPC client, on the site's RPC (NEXT_PUBLIC_RPC_URL: public configuration, never a paid
 *          key, A-5). The SDK reads accounts, simulates and polls signature status through it; nothing here opens a
 *          WebSocket. Until Sprint 08's `/rpc` relay exists, this is the public devnet endpoint by default.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { rpcFor } from "@brot/sdk/read";

import { RPC_URL } from "@/lib/config";

export const rpc = rpcFor(RPC_URL);
