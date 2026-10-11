# Wallet in-app browser checklist (X2.2)

Sprint 19, 2026-10-10. The plan's exit criterion X2.2 asks that the site pass a checklist in Phantom's and Solflare's
in-app browsers, on Android and on iOS, opening a campaign included (TP §3.6, S1b; Sprint 13 DoD; Sprint 19 DoD). This
is that checklist. It needs real phones, so it is run by a person and the result is recorded in the sprint's file
(date, device, operating system, wallet and its version, and each step's result). The web smoke covers the same steps
in a desktop browser and at 412 CSS px against a local chain (`bun run e2e`); this list is what the smoke cannot see:
the wallet's own browser, its signing screen and its way of returning to the page.

Run it on devnet, against the site's devnet build, with **a test wallet that holds no real funds**: Phantom uses the
same keys on every network, so a main wallet would tie devnet activity to a real one. It needs enough test SOL for
the total the box shows (US$500 of SOL at the price it shows, plus about 0.005 SOL of rent and fees; the faucet is
linked from the site).

## Each wallet, each phone

| # | Step | What should happen |
| --- | --- | --- |
| 1 | Open the site's address in the wallet's own browser | The page loads in the dark theme. The devnet and not-audited notices are at the top; the footer links the privacy page and says the age rule. Write down any warning the wallet shows about the site, the program or a transaction |
| 2 | "Use Installed Wallet" in the top bar | The wallet asks to connect, once; the bar shows the shortened address and the SOL balance |
| 3 | Disconnect, then connect again | Both work; nothing is signed |
| 4 | Open a campaign page from the list | The sentence, the proof, the pot and the entry panel show; the page does not scroll sideways |
| 5 | Join YES with 0.01 SOL, "Review entry" | "Check before you sign" lists the side, the amount, the estimate, the floor, the rents and the lock notice, and the summary of the bytes |
| 6 | "Sign in wallet" | The wallet's screen shows about the total the sheet showed; after signing, "You're in" |
| 7 | "My entries" | The entry is there, with its side and amount |
| 8 | Open `/abrir?t=price-touch&feed=BTC/USD&target=<110% of BTC's price>&days=7` from a note or a message | The box says "Filled from a link. Check every field: a link never signs anything." with the fields filled in and US$500 as the amount; nothing asks the wallet to sign. Only a phone shows whether the in-app browser keeps the link's query |
| 9 | Go to "Open a campaign" (`/abrir`) from the site's menu | The box shows its four parts (What, Details, Preview, Cost); on the phone, a bar at the bottom keeps the total and the button. Before anything is filled in, the cost already shows the SOL for US$500 at Pyth's price |
| 10 | Pick BTC/USD (or another fresh feed), a target 10% above the price, 7 days | The sentence fills in; "If resolved now" says NO; the cost shows the SOL at Pyth's price, the 90/10 split, the most you'll pay, the rent and the total |
| 11 | "Review and sign" | "Check before you sign" lists the campaign id, the kind, the account, the feed, the target, the deadline, when entries close, the opening, `max_lamports`, the rent and the total, and the summary of the bytes; under them, the notices: the devnet line, where the prize goes, no taking it back, the no-entry rule, what devnet does not send by itself, that an opening is public, the age line. On a burn campaign, the creator notice is highlighted above them |
| 12 | "Sign in wallet" | The wallet's screen shows about the total the sheet showed, and no more than its "at most"; after signing, "Opened. Your campaign is live." and "Go to the campaign" opens its page |
| 13 | Repeat 10 to 12, but leave the wallet app while it asks to sign, wait a minute, come back, then approve or reject | Rejected: "You refused it in your wallet", "Nothing was sent." Approved in time: "Opened. Your campaign is live." Approved too late (a devnet blockhash lives about 35 seconds): the wallet's own check most likely fails ("The transaction failed", nothing charged), or the page checks and shows "It didn't open" with "Review again". Trying again reuses the same campaign id, and nothing is charged twice |
| 14 | Only with a team key's wallet: open a campaign | The box says the opening is free, with no prize and no creator share; the wallet shows only the rent and the network fee |

Then, with the campaign opened in step 12, read it back with the read-only check (`scripts/team/check-opening.ts`;
the command is in `deploy/devnet/README.md`, "Checking an opening"): what it charged equals the quote's formula at
the price it read, split as prize plus opening fee.

## Recording the result

One line per run in `docs/sprints/sprint-19-site-open-campaign.md`: the date, the phone and its system, the wallet and
its version, the steps that passed and, for any that did not, what the screen showed. Leave the wallet's address out
(the check prints the creator's): next to a phone model and a date, it ties a person to a wallet. A step that fails is
a finding of the sprint, not of the wallet, until the cause is known.
