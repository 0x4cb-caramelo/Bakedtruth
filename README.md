<p align="center">
  <img src="docs/product/poses/small/14-pao-inteiro.png" alt="The Brot loaf" width="150" />
</p>

<h1 align="center">brot.markets</h1>

<p align="center">
  <strong>On-Chain Campaigns the chain answers.</strong><br />
  Join YES or NO with SOL. Winners split the pot. No vote, no judge.<br />
  <em>Proof &gt; Promises.</em>
</p>

<p align="center">
  <a href="https://github.com/0x4cb-caramelo/Bakedtruth/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/0x4cb-caramelo/Bakedtruth/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="Network: Solana devnet" src="https://img.shields.io/badge/network-Solana%20devnet-eea546?style=flat-square&labelColor=10151c" />
  <img alt="Audit: not yet" src="https://img.shields.io/badge/audit-not%20yet-eea546?style=flat-square&labelColor=10151c" />
  <img alt="Oracle: the chain" src="https://img.shields.io/badge/oracle-the%20chain-eea546?style=flat-square&labelColor=10151c" />
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-eea546?style=flat-square&labelColor=10151c" />
</p>

> **gm.** This is devnet. Test SOL only, no real money. The program is **not audited**. Still baking.

## What this is

Brot Markets runs **On-Chain Campaigns** on Solana: a YES/NO question that an on-chain account answers.

A project that promised its holders something measurable ("we burn 100M tokens by Nov 30", "we lock the liquidity on
Meteora") opens a campaign on it and funds the prize. Its community takes sides with SOL. At the deadline the program
reads the target account, and the winning side splits the pot. Nobody reports the result: no committee, no token vote,
no AI model, no "source: trust me bro".

It is the prediction-market mechanic pointed at one job: a milestone becomes a campaign that proves itself.

### The degen summary

- Roadmaps are promises. Accounts are proof. We only read accounts.
- One pot per campaign, all in SOL. No order book, no outcome tokens, no early exit, no cap.
- The oracle is the chain. It has no Discord and it does not take DMs.
- Devnet, unaudited, test money. Anyone telling you otherwise is not us.

## How a campaign works

> _"One pot. No order book."_ — Baked

1. **Open.** Any wallet opens a campaign for US$500 in SOL, priced at the Pyth SOL/USD feed. 90% goes into the pot as
   the prize and 10% is Brot's opening fee. The team and launch partners open free. A campaign runs from 3 to 90 days.
2. **Join.** Bakers join YES or NO with SOL, from 0.01 SOL. No sign-up: a wallet is enough.
3. **Lock.** The program refuses new entries once the outcome is knowable on-chain. There is no sniping an answer that
   is already sitting in the account, and an entry that lands after the YES proof is refunded whole.
4. **Resolve.** Any wallet can call `resolve_campaign`. The caller chooses nothing: the program reads the account and
   records YES, NO or Void. A YES can be recorded as soon as the fact is on-chain, a NO only after the deadline. A
   six-hour review window opens.
5. **Settle.** After the window anyone can crank the settlement. Winners are paid straight to their wallets. There is
   no claim button.

Brot keeps 10% of the losing side. The creator earns 1% of the entries, paid out of the losing side and never out of a
winner's own entry.

```text
EXAMPLE · NOT A LIVE CAMPAIGN

"Does $LOAF burn 100M tokens by Nov 30?"      opened for US$500; say SOL is at $200, so 2.5 SOL
                                              2.25 SOL prize  +  0.25 SOL opening fee

YES side    30.00 SOL
NO side     70.00 SOL
Answer      YES, read from the mint's supply

Brot         7.00 SOL    10% of the losing side
Creator      1.00 SOL    1% of the 100 SOL of entries
Winners     94.25 SOL    30 + 70 - 7 - 1 + 2.25, split by what each put in

A baker with 3 SOL on YES holds 10% of the winning side and receives 9.425 SOL.
```

When it does not go to plan:

- **Only one side showed up.** Everyone gets their entry back. Each entry after the first baker's pays a 1% fee, the
  prize returns to whoever opened, and there is no creator share.
- **Void.** The account could not be read after the deadline, the Pyth feed went stale, or the team voided the campaign
  inside the review window. Every entry is refunded whole and the prize returns to whoever opened.

## What the chain can answer

> _"I only believe accounts."_ — Baked

Five kinds. The list is closed on purpose: one reader per file, and no generic "read anything" reader.

| Kind | The question | What the program reads | On devnet today |
| --- | --- | --- | --- |
| `PriceTouch` | Does the price touch X by the deadline? | A Pyth price account, from the upgraded receiver only | Running |
| `SupplyAtMost` | Is the supply at or below X by the deadline? (the burn) | An SPL mint with no mint authority | Running |
| `DammV2LockedAtLeast` | Is at least X of liquidity permanently locked? | A Meteora DAMM v2 pool | Tested on mainnet account bytes; there is no devnet pool to read |
| `StakePoolTvlAtLeast` | Does the stake pool hold at least X in epoch N? | An SPL stake pool | Tested on mainnet account bytes |
| `StakeAtLeast` | Does the validator have at least X staked in epoch N? | The epoch stake of a vote account | Switched off until a YES is recorded on devnet |

What it will not answer: elections, football, "is this a good project", holder counts, a dashboard's TVL, or anything a
human would have to type in. If no Solana account holds the answer, there is no campaign.

Every third-party layout (Pyth, SPL mints, stake pools, DAMM v2, vote accounts) is tested against real mainnet account
bytes kept in `tests/fixtures`, with a SHA-256 per file.

## Can it be rigged?

> _"It's a read. Not a vote."_ — Baked

Fair question. This is the part with no jokes in it.

- **The creator** controls one thing: whether it keeps its promise. YES wins only if it does.
- **The wallet that resolves** chooses nothing, and `resolve_campaign` refuses to run inside another program's call.
- **The facts** are the kind that cannot be undone: a burn on a mint with no mint authority, liquidity that is
  permanently locked, a price touch proven by a fully verified Pyth update.
- **Entries stop** once the outcome is knowable, so nobody joins a campaign that is already decided.
- **Balances are bookkept** in the campaign account and never read from a vault's balance. Sending lamports to a vault
  changes nothing.
- **Every instruction emits one event**, numbered in sequence per campaign, so anyone can replay what happened.

What our keys can do, all of it:

- **A team key** (up to five, one per person) can, inside the six-hour review window, confirm the result early or void
  the campaign. A void refunds everyone, records its reason and emits an event. A team key cannot turn a YES into a
  NO, or a NO into a YES.
- **A team key** can also pause new entries and new campaigns. The pause never stops a payout, and only the admin
  lifts it.
- **The admin key** changes fees and creation parameters, inside ceilings compiled into the program: at most 10% of
  the losing side for Brot and at most 1% of the entries for the creator. Campaigns already open keep the values they
  started with.
- **The admin key** also names the team keys and the wallet that receives Brot's fees, and hands the admin role over
  in two steps.

What is not solved yet:

- The program is upgradeable, and on devnet one key holds the upgrade authority. That is fine for test money and not
  fine for real money. The multisig comes before mainnet.
- Nothing here has been audited. Everything above is our claim and our tests, not a third party's.

## What is baked and what is still dough

> _"Still baking."_ — Baked

As of 10 October 2026.

| Piece | State |
| --- | --- |
| Program, `programs/brot-markets` (Rust, Pinocchio) | **Baked.** On devnet. The full cycle (open, join, resolve, settle) has run end to end, with the team's own wallets |
| SDK, `packages/sdk` (`@brot/sdk`) | **Baked.** `read`, `tx` and `schemas` over the Codama client generated from the Shank IDL |
| Keeper, `services/keeper` | **In the oven.** Runs on our server, watching devnet, and is built to resolve a campaign when its reader allows. It has not had a real campaign to resolve yet. Settlement tasks, the standby and the watchdog come next |
| Indexer and API | **Dough.** Not started |
| Site | `brot.markets` is a coming-soon page with a waitlist. The campaign screens exist as a prototype with mock data. Entries are made by script: there is no YES/NO button yet |
| `app/` | The front end of the program this repository grew from. It leaves when the new site arrives |
| Android app | **Dough.** Planned for the Solana dApp Store |
| Audits | None yet. Two are planned before mainnet |
| Mainnet | Not before the audits and their fixes |

No outside users yet. We say so because someone will check.

Devnet program id:
[`5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`](https://explorer.solana.com/address/5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o?cluster=devnet).
The order of the work is in [`docs/SPRINTS.md`](docs/SPRINTS.md), and what changed is in [`CHANGELOG.md`](CHANGELOG.md).

## Run it

You need Bun 1.4.2, Rust 1.89 (pinned by `rust-toolchain.toml`), the Solana CLI 3.1.x and, for the IDL, shank-cli 0.4.9.

```bash
bun install
bun run build:program        # cargo build-sbf into target/deploy, then the IDL
bun run test                 # TypeScript suites on LiteSVM, in-process, no validator
bun run test:rust            # host tests and Mollusk
bun test services/keeper     # the keeper, no cluster needed
bun run lint
```

The suites load the program binary, so build before testing after any program change. The SDK's own tests
(`tests/sdk/`) need no binary.

To watch a whole campaign cycle, run `bun run smoke:devnet`. It acts on a local cluster by default and touches devnet
only with `-- --cluster devnet`. The deploy procedure is in [`deploy/devnet/README.md`](deploy/devnet/README.md).

CI builds the program and runs all of the above. It fails when the committed IDL or the code map is stale, and when a
branch adds something shaped like a credential.

## Repository map

```text
programs/brot-markets/   the program: state, checks, readers, instructions, math, events
packages/sdk/            @brot/sdk: read, tx, schemas, the Shank IDL and the Codama client
services/keeper/         the bot that resolves campaigns
services/landing/        brot.markets: coming-soon page, waitlist, terms, privacy and the deck
tests/                   LiteSVM suites, SDK contract tests and the mainnet fixtures
scripts/                 IDL build, devnet smoke and seed, deploy and team commands
deploy/                  the devnet deploy procedure and the server files
docs/                    business plan, technical plan, sprints, legal and product
knowledge-base/          research, with sources
session-log/             why each decision was made
prototype-lab/           the design directions and the campaign screens
app/                     the old front end, on its way out
```

[`CODEMAP.md`](CODEMAP.md) lists every code file with one line on what it does.

## Under the crust

House rules for the program. They are checked by CI, not by good intentions.

- **Pinocchio, no Anchor.** Every check Anchor used to make is written by hand, has its own error code and its own
  negative test. A mutation script removes each check and shows its tests fail.
- **One instruction per file, one reader per file,** under 200 lines each.
- **Checked math only.** Clippy denies unchecked arithmetic and truncating casts in the crate.
- **Owner first.** The owner of an account is checked before a single byte of it is read.
- **The money math is pure,** and the SDK replays its 24,000 test vectors, so the client and the program agree to the
  lamport.
- **Layouts are pinned.** Fixed little-endian accounts with a tag and a version. Enums are appended, never reordered.
  Error codes are appended, never reused.

The full design is in [`docs/technical/TECHNICAL-PLAN.md`](docs/technical/TECHNICAL-PLAN.md).

## Where this came from

It started as `pred-provable`, "Provable KPI Markets", an Anchor program by Ronaldo Pereira in which a sponsor sold
discounted YES tokens as a bounty on an on-chain goal. In October 2026 we redefined the product as pot-based campaigns
and rewrote the program on Pinocchio. What carried over is the best idea in it: **resolution is a read, not a
judgement.** Its readers were ported and the old program left the workspace, with the Anchor toolchain.

`ECONOMICS.md`, `RESOLVERS.md`, `NAMING.md`, `PRIVACY_PLAN.md` and `OPTIMIZATION.md` at the root describe that earlier
program. They stay as its record and are not the product.

The repository also carries the AI Dev Operating System by Lucas Galvão (`.claude/`, `WIZARD.md`, `START-HERE.md`): the
rules, review agents and session logs we work under. We ship with Claude Code. Humans make the product decisions and
press merge.

## The bakers

| Who | What |
| --- | --- |
| Bernardo Nery | Head Baker · CEO |
| Lucas Galvão | Chief Oven Officer · COO and CLO |
| Ronaldo Pereira | Chief Toasting Officer · CTO |
| Baked | Mascot. Grumpy. Believes only accounts |

[brot.markets](https://brot.markets/) · [@brotmarkets on X](https://x.com/brotmarkets)

## FAQ, asked the way you would ask it

**wen mainnet?**
After two audits and their fixes. Not a day earlier.

**wen site?**
In the oven. Today an entry is a script, not a button.

**who decides who wins?**
An account. `resolve_campaign` reads it. Nobody types the answer in.

**can the devs rug the result?**
They can void a campaign inside the review window, which refunds everyone. They cannot pick a winner. They also hold
the upgrade key on devnet, which is one of the reasons this is still devnet. See [Can it be rigged?](#can-it-be-rigged)

**can I open a campaign about the election, my ex, or the vibes?**
No. If no Solana account holds the answer, there is no campaign.

**why bread?**
_Brot_ is German for bread. Also, good dough needs proof. So do promises.

**why is the loaf angry?**
He has read too many roadmaps.

**is this financial advice?**
It is a loaf of bread. No.

## Fine print

Brot Markets is in a test phase on Solana devnet, with test tokens. The program is not audited. Nothing in this
repository is an offer or an invitation to put in real money, and availability by country has not been decided.

[Terms](https://brot.markets/terms) · [Privacy](https://brot.markets/privacy)

Found a hole in the program? Tell us before you tell the timeline: [@brotmarkets](https://x.com/brotmarkets).

## License

MIT. See [`LICENSE`](LICENSE).

<p align="center">
  <img src="docs/product/poses/small/e02-cetico.png" alt="Baked, the Brot Markets mascot, looking skeptical" width="120" /><br />
  <sub><em>"Prove it."</em></sub>
</p>
