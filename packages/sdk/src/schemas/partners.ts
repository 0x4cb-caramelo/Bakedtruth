/**
 * Purpose: `content/partners.json` (TP §4 "Content files"; BR-19, P-3, D-d; Sprint 08): which campaign belongs to which
 *          launch partner, with its highlight window, read by the indexer's ranking and partner report and, from
 *          Sprint 10, by the site. A JSON array of partners, each with a stable key, a public name, the optional seal
 *          and link a partner or a sponsor shows (Sprint 10 and 15), and its campaigns. A campaign is named by its u64
 *          id and its `opens_at` (Unix seconds), as content/unlisted.json names one, since a closed campaign's id can
 *          carry a new campaign later. A highlight lasts at most 72 hours (P1 §3.8). A team key opens each partner
 *          campaign (P-3); the indexer checks that on-chain before it highlights one. The zod schema is the check;
 *          content/partners.schema.json is generated from it (scripts/check-content-schema.ts).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * The file is public and permanent in Git, changed only with two people's review: a name holds no email address,
 * @handle, URL or domain (`personalDataIn`), and a link is a plain https address with no user, query or fragment.
 */
import { z } from "zod";

import { personalDataIn } from "./void-log";

/** The longest highlight a partner campaign gets (P1 §3.8): 72 hours. */
export const HIGHLIGHT_MAX_SECONDS = 72 * 3_600;

const U64_MAX = 18_446_744_073_709_551_615n;
const CampaignId = z
  .string()
  .regex(/^(0|[1-9]\d{0,19})$/, "a campaign's u64 id as a decimal string")
  .refine((v) => /^\d+$/.test(v) && BigInt(v) <= U64_MAX, { message: "at most 2^64 - 1" });
const UnixSeconds = z.string().regex(/^(0|[1-9]\d{0,11})$/, "Unix seconds (UTC) as a decimal string");

/** Letters, digits, spaces and a few marks, 1 to 32 characters: never a sentence, a link or a handle. */
const NAME = /^(?=.{1,32}$)[A-Za-z0-9][A-Za-z0-9 .$\-/&+']*$/;
const PublicName = z
  .string()
  .regex(NAME, "1 to 32 plain characters")
  .refine((name) => personalDataIn(name) === null, { message: "no email address, @handle, URL or domain" });

const Slug = z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/, "1 to 32 lower-case letters, digits or dashes");
/** An https address: a host and an optional path, no user, port, query or fragment. */
const Link = z
  .string()
  .regex(/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[A-Za-z0-9._~\-/]*)?$/, {
    message: "an https link: a host and a path, no user, port, query or fragment",
  })
  .max(200);
const Seal = z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}\.(?:svg|png|webp)$/, "an image file name (svg, png or webp)");

export const PartnerCampaignSchema = z
  .object({
    id: CampaignId.describe("The campaign's u64 id"),
    opensAt: UnixSeconds.describe("The campaign's opens_at: with the id, it names one opening of the address"),
    highlightFrom: UnixSeconds.describe("When its highlight starts, Unix seconds UTC"),
    highlightUntil: UnixSeconds.describe("When its highlight ends (excluded), at most 72 hours after it starts"),
  })
  .strict()
  .refine((c) => highlightFits(c.highlightFrom, c.highlightUntil), {
    message: "the highlight ends after it starts, at most 72 hours later",
    path: ["highlightUntil"],
  });

/** Whether a highlight ends after it starts and lasts at most 72 hours (false for anything not two whole numbers). */
function highlightFits(from: unknown, until: unknown): boolean {
  if (typeof from !== "string" || typeof until !== "string" || !/^\d+$/.test(from) || !/^\d+$/.test(until))
    return false;
  const length = BigInt(until) - BigInt(from);
  return length > 0n && length <= BigInt(HIGHLIGHT_MAX_SECONDS);
}

export const PartnerSchema = z
  .object({
    partner: Slug.describe("A stable key for the partner: the partner report's file names start with it"),
    name: PublicName.describe("The partner's public name, as its project publishes it; never a person"),
    link: Link.describe(
      "The partner's own public link, shown with its seal (Sprint 10; a sponsor's, Sprint 15)",
    ).optional(),
    seal: Seal.describe(
      "The partner's seal, an image file the site serves (Sprint 10; a sponsor's, Sprint 15)",
    ).optional(),
    campaigns: z
      .array(PartnerCampaignSchema)
      .max(50)
      .describe("The partner's campaigns, each opened by a team key (P-3); empty for a sponsor with no campaign"),
  })
  .strict();

export const PartnersFileSchema = z
  .array(PartnerSchema)
  .max(500)
  .superRefine((partners, ctx) => {
    const keys = new Set<string>();
    const campaigns = new Set<string>();
    partners.forEach((p, i) => {
      if (keys.has(p.partner))
        ctx.addIssue({ code: "custom", message: "a partner key appears twice", path: [i, "partner"] });
      keys.add(p.partner);
      (p.campaigns ?? []).forEach((c, j) => {
        const key = `${c.id}|${c.opensAt}`;
        if (campaigns.has(key))
          ctx.addIssue({
            code: "custom",
            message: "a campaign belongs to one partner, once",
            path: [i, "campaigns", j],
          });
        campaigns.add(key);
      });
    });
  });

export type PartnerCampaign = z.infer<typeof PartnerCampaignSchema>;
export type Partner = z.infer<typeof PartnerSchema>;

/** The checked list, or a thrown error naming the first problem's place (`partners[0].campaigns[1].highlightUntil`). */
export function parsePartners(text: string): Partner[] {
  const parsed = PartnersFileSchema.safeParse(JSON.parse(text));
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues[0];
  const at = issue.path.map((p) => (typeof p === "number" ? `[${p}]` : `.${String(p)}`)).join("");
  throw new Error(`partners${at}: ${issue.message}`);
}

/** The JSON Schema of the file, as committed at content/partners.schema.json. */
export const partnersJsonSchema = () => ({
  ...z.toJSONSchema(PartnersFileSchema, { unrepresentable: "any" }),
  title: "content/partners.json (Brot Markets)",
  description:
    "Generated from packages/sdk/src/schemas/partners.ts by scripts/check-content-schema.ts --write; the zod schema is the check (it also refuses personal data in a name, a partner key or a campaign listed twice, and a highlight longer than 72 hours).",
});
