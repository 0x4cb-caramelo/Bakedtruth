# content/

Public files the site reads on its server when it is built. Each changes only by a commit that two people review
(there is no CODEOWNERS file yet, so the second review is a team rule until Sprint 16). The site finds this folder or
fails its build (`app/lib/content.ts`); a change appears once it is merged and the site is built and deployed again.

| File            | What it is                                                                                     | Page                                   |
| --------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| `void-log/`     | The team's public text for each void it records, and corrections (its own README)              | `/record`, and the campaign's page     |
| `powers.md`     | Who holds each key and the limit of each power (BR-41); Sprint 16 updates it with the multisig | `/record`                              |
| `unlisted.json` | Campaigns the team took off the home page after a report (C-10)                                | The home page, and the campaign's page |

## Unlisting a campaign after a report

Reports arrive on X (https://x.com/brotmarkets), by direct message or mention. Unlisting is display only: the campaign
stays on-chain with its link, and its entries, result and payouts do not change.

1. Read the report and the campaign's page. Unlist only a campaign that misleads or abuses; a result someone dislikes
   is not a reason.
2. Add one entry to `unlisted.json`:

   ```json
   { "id": "<the campaign's number>", "opensAt": "<its opens_at>", "reason": "<public text>", "at": "<UTC time>" }
   ```

   - `opensAt` is the campaign's `opens_at` (Unix seconds), from `/api/v1/campaigns/<address>` or the account. A closed
     campaign's number can carry a new campaign later; the opening time keeps the entry on the right one.
   - `reason` is public and permanent in Git: no email address, @handle, URL or domain (the build refuses them), and no
     person's name. Keep it generic ("Misleading name."); naming a project as misleading is for the team to weigh.

3. Open a pull request; a second person reviews it; merge; build and deploy the site.

A malformed file fails the build, so a mistake never unlists the wrong campaign silently. The campaign page reads the
file on each request and keeps working without it if it cannot be read.
