/**
 * Purpose: A-8 on the site: the program deploy this bundle was built for (ProgramData's slot), baked at build time by
 *          next.config.ts. `null` when the build could not read it: such a build never signs. Every preparation and the
 *          hand-off to the wallet check it against the program's last deploy (`assertDeploy` in the SDK).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8)
 */
import { deploySlotFrom } from "@brot/sdk/read";

export const BUILT_FOR: bigint | null = deploySlotFrom(process.env.NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT);
