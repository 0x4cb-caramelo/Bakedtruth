# Wallet in-app browser checklist (X2.2)

Sprint 19, 2026-10-10. The plan's exit criterion X2.2 asks for a checklist that passes in Phantom's and Solflare's
in-app browsers, on Android and on iOS, opening a campaign included (TP §3.6, S1b; Sprint 13 DoD; Sprint 19 DoD). This
is that checklist. It needs real phones, so it is run by a person and the result is recorded in the sprint's file
(date, device, operating system, wallet and its version, and each step's result). The web smoke covers the same steps
in a desktop browser and at 412 CSS px against a local chain (`bun run e2e`); this list is what the smoke cannot see:
the wallet's own browser, its signing screen and its way of returning to the page.

Run it on devnet, with a wallet that holds test SOL (about 6 SOL for the paid opening; the faucet is linked from the
site), against the site's devnet build.

## Each wallet, each phone

| # | Step | What should happen |
| --- | --- | --- |
| 1 | Open the site's address in the wallet's own browser | The page loads in the dark theme. The devnet and not-audited notices are at the top; the footer links the privacy page and says the age rule |
| 2 | "Use Installed Wallet" in the top bar | The wallet asks to connect, once; the bar shows the shortened address and the SOL balance |
| 3 | Disconnect, then connect again | Both work; nothing is signed |
| 4 | Open a campaign page from the list | The sentence, the proof, the pot and the entry panel show; the page does not scroll sideways |
| 5 | Join YES with 0.01 SOL, "Review entry" | "Check before you sign" lists the side, the amount, the estimate, the floor, the rents and the lock notice, and the summary of the bytes |
| 6 | "Sign in wallet" | The wallet's screen shows about the total the sheet showed, for the Brot Markets program; after signing, "You're in" |
| 7 | "My entries" | The entry is there, with its side and amount |
| 8 | Go to "Open a campaign" (`/abrir`) | The box shows its four parts (What, Details, Preview, Cost); on the phone, a bar at the bottom keeps the total and the button |
| 9 | Pick BTC/USD (or another fresh feed), a target 10% above the price, 7 days | The sentence fills in; "If resolved now" says NO; the cost shows the SOL at Pyth's price, the 90/10 split, the most you'll pay, the rent and the total |
| 10 | "Review and sign" | "Check before you sign" lists the campaign id, the kind, the account, the feed, the target, the deadline, when entries close, the opening, `max_lamports`, the rent and the total, and the summary of the bytes |
| 11 | "Sign in wallet" | The wallet's screen shows about the total leaving the wallet for the Brot Markets program; after signing, "Opened. Your campaign is live." and "Go to the campaign" opens its page |
| 12 | Repeat 9 to 11, but leave the wallet app while it asks to sign, wait a minute, come back and approve or reject | The page says it is checking whether the campaign opened, then shows it opened, or "It didn't open" with "Review again"; trying again reuses the same campaign id, and nothing is charged twice |
| 13 | With a team key's wallet only: open a campaign | The box says the opening is free, with no prize and no creator share; the wallet shows only the rent and the network fee |

Then, with the campaign opened in step 11, read it back with the read-only check (`scripts/team/check-opening.ts`;
the command is in `deploy/devnet/README.md`, "Checking an opening"): what it charged equals the quote's formula at
the price it read, split as prize plus opening fee.

## Recording the result

One line per run in the sprint's file: the date, the phone and its system, the wallet and its version, the steps that
passed and, for any that did not, what the screen showed. A step that fails is a finding of the sprint, not of the
wallet, until the cause is known.
