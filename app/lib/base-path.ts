/**
 * Purpose: the path the site is served under, from NEXT_PUBLIC_BASE_PATH at build time (`/dev0x` on brot.markets, where
 *          the tunnel sends it; empty locally and in the web smoke), and the URL of a file in `public/` under it. Next
 *          adds the base path to its links, its router and its own files, never to an `<img src>`, a manifest's icons or
 *          a path handed to a wallet: those go through `asset()`. next.config.ts checks the value's shape.
 * Version: 0.1.0
 * Sprint:  09 (site shell), the /dev0x deploy
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** A file in `public/` as the browser asks for it: `asset("/mascot/deadpan.png")` → "/dev0x/mascot/deadpan.png". */
export const asset = (path: `/${string}`): string => `${BASE_PATH}${path}`;
