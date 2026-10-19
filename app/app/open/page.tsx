/**
 * Purpose: the creation route (the creation box, Sprint 19; TP §3.6): any wallet opens an On-Chain Campaign inside the
 *          rules. The server passes only the reviewed account names (content/account-names.json, read here) and a
 *          link's prefill (`?t=`, the slots; prefill.ts checks each one and drops the rest); the box reads the chain and
 *          prepares the transaction in the browser, and a link never signs anything. No third-party script (K-10).
 * Version: 0.2.0 (Sprint 19: the box; 0.1.1, Sprint 13's wording of the shell)
 * Sprint:  09 (site shell, theme and wallet); 13; 19
 */
import type { Metadata } from "next";

import { loadNames, type KnownName } from "@/features/open-campaign/names";
import { OpenBox } from "@/features/open-campaign/open-box";
import { prefillOf } from "@/features/open-campaign/prefill";

export const metadata: Metadata = { title: "Open a campaign · Brot Markets" };

export default async function Page(props: PageProps<"/open">) {
  const query = await props.searchParams;
  // A malformed names file is the team's mistake to fix: the box still opens, naming no account (A-11: names are
  // never a gate), and the error is logged.
  let names: KnownName[] = [];
  try {
    names = loadNames();
  } catch (error) {
    console.error(
      `creation box: the reviewed names could not be read (${error instanceof Error ? error.message : "Error"})`,
    );
  }
  return (
    <section className="py-2">
      <OpenBox prefill={prefillOf(query)} names={names} />
    </section>
  );
}
