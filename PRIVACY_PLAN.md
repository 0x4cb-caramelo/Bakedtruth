# Privacy Sprint + Zcash track: plan to mainnet

Written 2026-10-03 13:30 BRT, re-timed at 16:01 BRT (7h57m left). **Plan only: nothing has been spent, deployed, committed, published or submitted.**
Superteam Privacy Sprint closes **today 23:59 BRT**. Colosseum closes **12 Oct 23:59 PT = 13 Oct 03:59 BRT**.

Evidence tags: **[V]** verified by me this session (command or file) · **[A]** verified by a research agent, artifacts
kept in the session scratchpad · **[U]** unverified or inferred. Agent claims that drive a decision were re-checked by me
where marked [V].

## 0. The call

Build **Private mode: public proof, private backer and payout.**

- A backer (or sponsor) funds a one-time **stealth wallet** through Cloak and trades the mainnet KPI market from it. The
  market, price, goal and on-chain proof stay public; the link between the stealth wallet and the person behind it does not.
- Winnings leave through Cloak again, or as **shielded ZEC** (NEAR Intents 1Click to the user's own Zodl address).
- A **viewing key** exports the history as a CSV, so a treasury shows an auditor everything and strangers nothing.

Why this angle:

1. It matches who judges it. Cloak's CFO, CTO and COO judge the sprint, two of them ex-BTG [A]: expect treasury,
   compliance and SDK-correctness questions. The viewing-key CSV and honest limits answer those. Cloak shipped Cloak
   Payroll on 28 Sep [A], so a payroll entry would read as a clone.
2. It needs **no program change.** Privacy is client-side composition around instructions that already have 138 passing
   tests [V]. The only on-chain work is the `--features mainnet` build.
3. Prior art leaves it open [A, hypothesis from top-20 hits per query]: private-market projects hide traders, Cloak
   projects are payroll, and none combines sponsor-sold YES, oracle-free resolution and a private backer.

| Clock | Deadline (BRT) | Prize | Needs |
| --- | --- | --- | --- |
| Superteam Privacy Sprint | Sat 03/10 23:59 | 5 x 100 USDC per pool (Cloak, Zcash); "both" allowed | Public repo, Cloak mainnet signature, video <= 2 min, text <= 300 words, **the/Garage membership** |
| Colosseum Zcash track | Tue 13/10 03:59 | 10 x $10k | Real Zcash integration, English pitch (2-3 min) and demo (<= 3 min) videos, live product link |
| Colosseum Solana track and general pool | same | 10 x $10k; $30k grand, 20 x $15k | same submission, up to 3 networks (Solana + Zcash) [U: only Superteam says so] |
| Trilha Brasil (Superteam x SolarEcoFund) | same | $5,000 USDG over 5 places + $1,000 USDC | Brazil as team location on Colosseum + Earn application [V] |

The 100 USDC is the bonus. The sprint entry doubles as the rehearsal for the Colosseum submission.

### What "mainnet" actually requires

- **Superteam:** the proof is a Cloak **mainnet** signature, and Cloak is mainnet-only. Cloak's own transactions satisfy
  it; our program on mainnet is **not** required [V: sprint rules + Cloak docs].
- **Colosseum:** I read all 8 pages of the rules: there is no deployment-network requirement [V]. Colosseum's own guide
  says to prioritize "an amazing working demo on devnet" [V: blog.colosseum.com].
- **Zcash cash-out:** NEAR Intents is mainnet-only [A], but it takes USDC from any mainnet wallet, market or not.

So deploying `pred-provable` on mainnet is optional. It strengthens Functionality, UX and the sprint's "fit with the
hackathon project" (20%), because only then can the stealth wallet trade what it was funded for. It is a choice, not a rule.

## 1. Rules, as a checklist

### 1.1 Superteam Privacy Sprint

- [ ] **Eligible:** the page's FAQ says only Colosseum participants who are "part of the/Garage" [V]. The/Garage is
  Superteam Brasil's in-person Cohort 2 at Solana House, 28 Sep-10 Oct, approval-required on Luma [A]. The form has no
  such field, so any check is manual. Verify in your Luma confirmation or by asking the host. Submitting costs nothing.
- [ ] Public repo, or access for the judges (GitHub: marcelofeitoza, matheusmacedosantos, vict0rcarvalh0 [A]). **Today the
  repo is PRIVATE [V].** Point to the branch, PR or commit range made during the sprint.
- [ ] Proof: a Cloak **mainnet** transaction signature (no Cloak devnet exists [V]).
- [ ] Demo video <= 2 min, hosted on YouTube, Loom or Vimeo only [V: form JS].
- [ ] Privacy text <= 300 words: what is hidden, from whom, what is gained. Weighted most.
- Scoring: privacy impact 30%, working product 30%, fit with the hackathon project 20%, UX and presentation 20%.
- Form [V: captured JS bundle]: connect an **X account first** (the redirect loses typed data); project_name 2-80;
  tagline 10-140; sprint_changes <= **300 characters**; writeup <= **300 words**; proof_type `solana_tx` = base58, 86-90
  chars; repo_url must be `github.com/owner/repo`; contact email receives the Cloak payment link; max 5 creates per hour per IP.
- **The edit link (`/editar/<token>`) is shown once** on `/enviar/sucesso` and the cookie lives about 120 s [A]. Copy it
  at once. Edits are allowed until 23:59:59.
- Everything except contact data and X identity goes public instantly [A].
- Tech field: `Cloak`, `Zcash` or `Os dois`. The proof field takes one proof, so use the Solana signature.

### 1.2 Colosseum Crypto World's Fair (official rules PDF [V])

- Window 14 Sep 06:00 PT to 12 Oct 23:59 PT. One team, one submission. Every member registers; the leader submits.
- **All content in English, videos included** (rule 12(a)(i)).
- Criteria: Functionality, Potential Impact, Novelty, UX, Open-source and composability, Business plan.
- Submission asks [A]: description, chains and tools, team, repo, **pitch video 2-3 min**, **demo video <= 3 min**,
  **live product link + access instructions**, go-to-market, disclosures (pre-existing code, outside contributors).
  Our first commit is 2026-10-01 [A], so it falls inside the window.
- Zcash track = "10 best products that integrate with the Zcash blockchain or asset" (§14(h)). The ZCG forum calls
  payment-rail-neutral rebrands poor value; past winners showed meaningful Zcash use (viewing-key accounting, shielded
  txs) [A]. Show real shielded txids and what stays public.
- Open-source is a scored criterion, a second reason to make the repo public.

### 1.3 Deadlines (BRT = PT + 4 h; Brazil has no DST)

| When | What |
| --- | --- |
| Sat 03/10 23:59 | Sprint submit and edit cut-off |
| Sat 10/10 | Sprint results; the/Garage Demo Day 13:00-19:00 (apply at hackathon.superteam.com.br/startup-registration) |
| Mon 12/10 18:00 | Our freeze |
| Tue 13/10 03:59 | Colosseum submission, member registration, Trilha Brasil |
| by Sat 05/12 | Colosseum winners |

## 2. Privacy model (feeds the 30% text, so it must be honest)

| Who | Sees | Does not see |
| --- | --- | --- |
| Chain observer, analytics | The market, price, goal and resolver; stealth wallet S and every trade it makes; A's Cloak deposit (amount, time); the relay-paid withdrawal to S | That A funded S, subject to the correlation limits below |
| Other backers, doers, copy-traders | S's position | Who is behind S; A's balance and history |
| Sponsor and doers | Each other's stealth wallets | Main wallets and treasuries |
| Our app and backend | Nothing: everything runs client-side, no server holds keys | n/a |
| **Cloak operator** (relay + authorizer) | Sender A, recipient S, IP, the viewing key `nk` in plaintext, amounts [A] | n/a. It can also refuse a deposit or an exit [A, inferred from its signed authorizations] |
| NEAR Intents (cash-out) | S as payer, the Zcash destination address, the amount | n/a. The destination address is public in NEAR's explorer and ZecBlock's index [A] |
| Zcash chain | A bridge-owned transparent output and a shielded action; the amount entering the pool | The recipient's unified address [A] |

**We claim:** the funder-to-stealth link is hidden on-chain; the payout destination is hidden from Solana observers; a
viewing key gives selective disclosure.
**We do not claim:** anonymity against Cloak's operator, strong anonymity today, or hiding the position or the goal.
The USDC pool has about 3,048 notes and about 50 vault transactions a day, and many amounts repeat [A]. A shield and
unshield in the same hour are trivially linkable.

**Policies the code should encode:** round denominations (5 / 10 / 25 USDC), a randomized delay of 30 minutes or more
between shield and unshield (demo runs are staged ahead), one stealth wallet per position, never move funds S to A.

## 3. What the research established

### 3.1 Cloak SDK 0.2.5

- **The docs lag the package [A].** `docs.cloak.ag/sdk/llms.txt` describes 0.2.2 (web3.js types). The installed 0.2.5 is
  `@solana/kit` based (`createCloakRpc`, `signerFromSecretKey`, async `getShieldPoolPDAs`); `llms-full.txt` and the
  releases page are correct. Trust the `.d.ts`. It pins `@solana/kit 8.3.0` exactly, the same as our `bun.lock`.
  - `TransactOptions` has **no `signTransaction` field**; the browser uses `signer: signerFromWalletAdapter(...)`.
  - Change notes are recoverable from `nk` if you pass `chainNoteViewingKeyNk` (docs say "permanently lost"; verified in
    source, not on-chain). Deposits recover through `createRecoverableDepositUtxo` + `chainNoteSalt`.
  - `generateKeyPairSigner()` keys are non-extractable, so S must come from a 32-byte seed via `signerFromSecretKey`.
  - No payment-link API in the SDK (an app feature). We do not use payment links.
- **Mainnet only** [A]: program `zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW`, relay `https://api.cloak.ag`. The USDC pool
  holds 2,562.72 USDC, the SOL pool 12.41 SOL. The `@cloak.dev/sdk-devnet` fork is not viable (its relay fails TLS).
- **Fees** [A]: deposit free to the protocol but costs the depositor about 0.00209 SOL (measured on a mainnet tx);
  exit 0.45 USDC + 0.3% (1.00 in gives 0.547 out) or 0.005 SOL + 0.3%; minimum deposit 1.00 USDC or 0.01 SOL.
- **The relay creates the recipient's USDC ATA** (seen for 3 fresh recipients, not a documented contract [A]), so S needs
  no pre-existing token account.
- **Cloak signs every deposit and exit** (its authorizer, with a Range screening quote) [A, inferred]. A flagged
  wallet is stuck. Its program authority is a 3-of-4 Squads with a 1 h timelock, and an upgrade (programs#18 / SDK
  0.2.6) is pending [A]: **pin 0.2.5 and re-run the smoke test before the final submit.**
- **Run it on Node, not Bun** [A]: the prover hangs for 10+ min under Bun 1.4.2 and takes about 7 s under Node.
  Node v26.8.1 is installed; `tsx` is not [V]. Our scripts are Bun; the privacy scripts need `tsx`.
- **Browser** [A, scratch Next 16.3.8 + headless Chromium]: Turbopack bundles it with an empty config. Client JS is
  2.14 MB gzipped; it fetches a 3.2 MB wasm and a 19.7 MB zkey (CORS `*`, cached). Proof takes 7 s in production
  and 13 s in dev, and the wallet is asked to sign again on every page load. Our `app/AGENTS.md` still requires
  reading `app/node_modules/next/dist/docs` before app code.
- **Persistence** [A]: `outputUtxos` come back once; drop zero-amount padding; `fullWithdraw` with 3 or more notes
  consolidates on-chain and can strand value, so use single-note withdrawals only; `serializeUtxo` is a 128-byte bearer
  instrument.
- `scanTransactions` walks all program signatures: always pass `afterTimestamp`, and use a paid RPC (the public one
  returned 429 within minutes).

### 3.2 Zcash and NEAR Intents

- **Shielded delivery works [V, re-run by me].** A dry quote of 5 USDC (Solana) to ZEC with a unified `u1...` recipient
  returned HTTP 201: 0.0034956 ZEC, about 137 s, withdraw fee 0.00032 ZEC. The docs say "transparent only"; they are
  stale [A: dry quotes, plus on-chain txs with shielded actions to u1 recipients]. Require an Orchard receiver (a
  Sapling-only unified address was accepted but may pay publicly [A, U]).
- Costs [A]: minimum about 1.74 USDC; fixed 0.00032 ZEC (about $0.42) plus 0.25% without a partner key. All-in about
  8.7% at $5 and 4.3% at $10. Live quotes can be refused by screening that dry quotes skip; keep amounts small.
- Public regardless [A]: the payer, the destination address (in NEAR's explorer) and the amount entering the pool.
- **SPL ZEC `A7bd...`** [V]: classic Token program, 8 decimals, no freeze authority, no extensions; mint authority is
  NEAR's Omni Bridge PDA. Jupiter-verified and liquid [A], so Cloak could swap into it. A bridged IOU, public, not private.
- **ZEC as market collateral is out** [A]: it breaks the compile-time USDC pin in 7 instructions, needs 8-decimal
  outcome tokens, orphans devnet markets and costs 25-40 h. Roadmap only.
- Tooling [A]: no maintained JS library for ZIP-321 or unified addresses; the agent wrote a tested module (60/60 official
  ZIP-316 vectors, ZIP-321 builder, 1Click dry and status) at
  `scratchpad/zcash-agent/kit/zcash-1click.ts` to port into the repo. Zodl is iOS and Android only; "Zodl Desktop" sites
  are scams. Explorer: zecblock.com (Blockchair mislabels the new transaction type).
- Competing 1Click-to-shielded apps already exist (PetraPay 29 Sep, ZCross 2 Oct) [A]. Ours differs by what feeds the
  cash-out: a provable KPI-market payout reached through a stealth wallet.

### 3.3 Our program on mainnet

- `target/deploy/pred_provable.so` is 579,504 bytes [V]. `solana rent` on mainnet gives **2.94475916 SOL** for the
  ProgramData account [V] (about **$350** at SOL near $120, from the 1Click price feed [V]). The README's "2.82 SOL" is
  stale. `solana program deploy` defaults `--max-len` to the binary's own length [V].
- A peer session's audit (`OPTIMIZATION.md`, untracked, nothing applied [V]) found that `opt-level = "s"` cuts the binary
  to 478,016 bytes, so the deploy rent to about **2.43 SOL** (-0.52), at +13% to +28% compute units per instruction. Its
  rent figure (5,080 lamports per byte) matches mine. Applying it means re-running every test before a deploy: your call.
- `--features mainnet` swaps `USDC_MINT` to `EPjF...` [V: `constants.rs`]. **The app reads the USDC mint from the IDL**
  (`app/lib/market.ts:32`), and the committed IDL carries the devnet value [V]. The app needs a cluster override.
- UI strings still say devnet [V]: `app/app/layout.tsx:32`, `app/app/api/chat/route.ts`,
  `app/components/chat/chat.tsx:98`, `app/components/market/trade-card.tsx:308`.
- Program ID `F9Kfeg...` is free on mainnet [V]. The devnet wallet `G5chPq...SVNM` holds **0 SOL and 0 USDC** on mainnet [V].
- Baseline is green [V]: 138 TS tests, `tsc`, `cargo fmt`, prettier. Rust tests and clippy were **not** run [U].
- Surfpool 1.5.0 is installed [V], so deploy and smoke can be **rehearsed free on a mainnet fork** first. There is no
  Docker, so no local `solana-verify` build.
- Repo state [V]: private; no secrets in HEAD, all history or the working tree; **34 uncommitted files**
  (+2,652/-245 lines); branch `feat/outcome-tokens-usdc` has diverged from origin by 1 commit each way. History was rewritten
  (`backup/pre-rewrite-0xcf02` exists) and six commits share one timestamp [A], which a judge may question. Keep new work
  in small, honestly dated commits.

## 4. Architecture

Principles: client-side only, no server holds keys; **framework-free modules shared by scripts, tests and the app**
(the repo's convention for `app/lib`); the heavy Cloak SDK is imported lazily in the browser.

```
app/lib/privacy/
  keys.ts      one 32-byte master secret M -> S seed, note spend key, nk (domain-separated sha256). Pure, unit-tested.
  store.ts     StealthStore interface; Node file store (0600, fsync, reload-verify); IndexedDB store later.
  cloak.ts     wrappers over @cloak.dev/sdk@0.2.5: shield, unshield, reshield, report. expectedMint set; every output
               persisted before the function returns.
  stealth.ts   privateEntry / privateExit orchestration, fee math, denomination and delay policy.
  zcash.ts     unified-address decode with Orchard gate, ZIP-321 builder, 1Click quote/status, ZecBlock verify.
scripts/privacy/   entry.ts  exit.ts  zec-cashout.ts  report.ts   (run with Node + tsx; thin shells over app/lib/privacy)
scripts/           mainnet deploy + smoke: cluster-aware generalization of devnet.ts / devnet-smoke.ts
```

Keys: M -> `S = signerFromSecretKey(sha256("pp/stealth/v1" || M || i))`; `noteSpendKey = sha256("pp/note/v1" || M)` ->
`deriveUtxoKeypairFromSpendKey` -> `nk = getNkFromUtxoPrivateKey(...)`. One backup covers S, the notes and the viewing
key [design, U until spiked]. M is written, fsynced and reloaded before any on-chain step.

Roles: **D** dedicated mainnet deployer and public sponsor; **A** demo "real" wallet that funds the private flow (funded
by you from Phantom; the scripts use a keypair file, the app will use the wallet adapter); **S** stealth wallet
derived from M; **T** throwaway doer key that controls the target test mint.

Flows:

1. **Entry.** A deposits USDC (5) into the USDC pool and about 0.0201 SOL into the SOL pool. After the delay, A's
   authenticated `fullWithdraw` sends each single note to S: S gets about 4.535 USDC and about 0.0148 SOL for gas.
2. **Trade.** S signs `create_market` (as sponsor) or `buy_yes`, then `redeem`, with the existing framework-free
   builders in `app/lib/instructions.ts`. Demo market: `MintAuthorityRevoked` on a fresh mint owned by T, so resolution
   is self-contained (create market, S buys, T revokes, anyone resolves, S redeems).
3. **Exit A (Cloak).** S deposits its USDC (a deposit is wallet-signed straight to chain; Cloak's own bridge deposits from a
   derived burner [A]) with a separate `nk`; A then `fullWithdraw`s to a fresh address P. A, the real wallet, signs every
   relay request, as Cloak's docs require for the authenticated sender.
4. **Exit B (Zcash).** S sends USDC into the 1Click one-time deposit address (SPL transferChecked into its ATA, S pays
   the ATA rent; this exact step is [U]: no funded run was seen). Poll status, then verify the Zcash tx on ZecBlock.
5. **Report.** `scanTransactions({ afterTimestamp })` -> `toComplianceReport` -> `formatComplianceCsv`.

## 5. Budget (SOL at about $120)

| Item | SOL | USDC |
| --- | --- | --- |
| Program rent, recoverable by `solana program close` after judging | 2.95 | |
| Deploy fees, create_market, test mint, T and D operations | 0.15 | |
| A: pool deposits and Cloak costs, two passes | 0.10 | 10 shielded |
| D: sponsor budget, two passes (mostly returned) | | 8 |
| Cloak exit fees (about 0.45 + 0.3% each) | | about 2 |
| **Path 2, full (deploy + round trip)** | **about 3.2 (about $385); about 2.7 with `opt-level = "s"`** | **about 20** |
| **Path 1, Cloak-only (proof today, no deploy)** | **0.1** | **8** |

You also need a paid RPC key (Helius or similar free tier): the public RPC returned 429 within minutes [A].

## 6. Schedule

### 6.1 Today (re-timed at 16:01 BRT for Path 1)

| BRT | Who | Work | Gate |
| --- | --- | --- | --- |
| 16:00-16:45 | You | Fund A (about 0.1 SOL + 8 USDC), get the RPC key, connect X in a browser tab, check the/Garage status, decide repo visibility | funds visible on-chain |
| 16:00-17:15 | Me | Branch `feat/private-mode`, commit the pending work (with your OK); add `tsx` and `@cloak.dev/sdk@0.2.5`; write `keys.ts`, `store.ts` + tests; generate wallet A (public address only printed) | tests green |
| 17:15-18:30 | Me | **Cloak spike on mainnet, Entry leg:** 5 USDC (plus 0.0201 SOL if Exit A stays), 2-4 signatures | **G1: S holds USDC; first Solscan-verifiable proof** |
| 18:30-19:30 | You + me | Record a 60-90 s v0 video, upload, **submit a valid entry** (repo public or shared by now, X connected, edit link saved) | **G2: an entry exists** |
| 19:30-21:00 | Me | Exit A (S re-shields, A unshields to a fresh address), CSV report, and the devnet half (S trades the live devnet market) | G3 |
| 21:00-21:30 | Me | **Feature freeze.** README privacy section, final 300-word text with the real signatures | |
| 21:30-22:45 | You + me | Final 2-min video, upload, update the form through the edit link; the name must be decided before recording | G4 |
| 22:45-23:30 | Both | Verify the public page, every link and every signature on Solscan; re-check Cloak `/health`; **stop at 23:30** | |

**Path 2 (mainnet deploy) is no longer realistic today.** It needs funds in D by about 17:00 and a 2-3 h deploy, rehearsal and
smoke block, which removes the buffer. Move it to 04-06 Oct.

**Cut order if late:** Exit B, then Exit A, then CSV, then the mainnet program (fall back to a devnet market shown beside
the mainnet Cloak proof, and say so). Never cut: Entry proof, text, video, public repo.

**Path 1 (Cloak-only, no mainnet deploy today).** There is no deploy block: Exit A and the CSV report (the Cloak half, on
mainnet) take its place, plus the market half on the existing **devnet** deployment. The stealth key is just a keypair, so
the same S address is funded with free devnet SOL and USDC and trades the live devnet market. Every video scene shows its
cluster, and the text says plainly that the market runs on devnet until the mainnet deploy. The sprint's fit score (20%)
suffers a little; the privacy and proof scores do not. The mainnet-deploy decision then moves to 04-06 Oct, when the
Colosseum Zcash integration needs a market payout to cash out.

### 6.2 12 Oct and before

| Day | Work |
| --- | --- |
| Sun 04 | Cluster-aware app (USDC override, mainnet banner, UI caps, copy), Vercel deploy, `MAINNET.md` |
| Mon 05 | In-app Private mode: stealth panel, signer abstraction, browser Cloak flow |
| Tue 06 | In-app ZEC cash-out, a second live Zcash txid, viewing-key export button |
| Wed 07 | Sponsor-stealth run; Rust tests and clippy for CI parity; hardening (RPC proxy) |
| Thu 08 | English copy; register the Colosseum team (Brazil location, Solana + Zcash); Earn application |
| Fri 09 | Pitch video (2-3 min) and demo video (<= 3 min) |
| Sat 10 | Sprint results; the/Garage Demo Day (apply); buffer |
| Sun 11 | Final mainnet QA |
| Mon 12 | Freeze 18:00 BRT, submit; deadline Tue 13 03:59 BRT |

## 7. Mainnet deploy runbook

1. **Keys.** `solana-keygen new -o ~/.config/solana/pred-provable-mainnet.json` for D. I only ever print public addresses.
2. **Fund D** with 3.2 SOL or more.
3. **Build.** `NO_DNA=1 anchor build -- --features mainnet` (cargo args pass after `--` [V]). Copy the `.so` to
   `artifacts/mainnet/`; **gate:** the binary contains the mainnet USDC pubkey bytes and not the devnet ones; record the
   sha256. Rebuild the default so tests and the committed IDL stay in sync (CI fails on a stale IDL).
4. **Rehearse on Surfpool** (`surfpool start --rpc-url <paid RPC>`; README documents the devnet variant): deploy, then run
   the smoke with the USDC cheatcode `surfnet_setTokenAccount`.
5. **Deploy.** `solana program deploy artifacts/mainnet/pred_provable.so --program-id target/deploy/pred_provable-keypair.json
   --keypair <D> --url <paid RPC> --with-compute-unit-price <p>`. If it is interrupted, resume from the buffer; if it fails,
   `solana program close` the buffer to recover the rent.
6. **Verify.** `solana program show F9Kfeg...`; `solana program dump` hash equals the artifact hash; the upgrade
   authority is D.
7. **Smoke on mainnet** with hard-coded caps (<= 10 USDC per run).
8. **App.** `NEXT_PUBLIC_CLUSTER=mainnet-beta`, a domain-restricted RPC key or a proxy route, USDC override in
   `app/lib/market.ts`, text changes in the four places above, remove "Get devnet USDC" on mainnet, add a "mainnet beta,
   unaudited, capped" banner.
9. **Record** the program ID and txids in `docs/mainnet-proof.md`; fix the README status line ("do not use with real funds").
10. **Authority.** Keep D (a hot key) through judging. Afterwards transfer to a multisig or revoke. Revoking is
    irreversible; the dogfood option is an `Immutable` market on our own program.
11. **After 5 Dec:** `solana program close` recovers about 2.95 SOL (standard for upgradeable programs; **[U] on this one,
    and the program ID is unusable afterwards**).

Caps: UI limits now. A program-level cap needs a program change, tests and a redeploy; skip it today.

## 8. Submission packs

### 8.1 Superteam form

| Field | Plan |
| --- | --- |
| project_name / team_name | `<NAME>` (see decision 4) / your name |
| tagline (10-140) | "Bounty markets resolved by on-chain reads. Public proof, private backer and payout." |
| category / tech | `Pagamentos privados` or `Integração com Cloak`; `Cloak` (`Os dois` only if the ZEC proof is done by 20:30) |
| repo_url | `https://github.com/0xcf07/pred-provable` (public by then) |
| sprint_changes (<= 300 chars) | branch, commit range, and "adds Private mode: stealth wallets via Cloak 0.2.5, mainnet runbook, ZEC cash-out" |
| proof | `solana_tx`: the Cloak withdrawal to S (base58, 86-90 chars) |
| demo_video_url | YouTube or Loom |
| writeup (<= 300 words) | 8.2 |
| colosseum_url / website_url | optional; the live app |
| contact | your email (the Cloak payment link goes there) |

### 8.2 The 300-word text (draft v0; fill the signatures, keep it under 300)

> A KPI market is public by design: the goal, the price and the on-chain proof that settles it. The people funding it should not be.
>
> **What is hidden.** In Private mode your main wallet never touches the market. It shields USDC into Cloak, and a one-time stealth wallet receives it from the pool and takes the position, as backer or as sponsor. The market is public; the link between the stealth wallet and the person behind it is not. When the goal is met, winnings leave the same way: re-shielded through Cloak, or cashed out as shielded ZEC to the user's own Zcash address. A viewing key exports the history as a CSV, so a treasury can show an auditor everything and strangers nothing.
>
> **From whom.** Other backers and doers who would copy or front-run a known participant. The counterparty: sponsors cannot target the doers, doers cannot read a sponsor's treasury. Token traders who read a team's intent from its wallet. Analytics that turn a wallet into a public diary of income.
>
> **What you gain.** Taking part in a bounty no longer means publishing your balance, your strategy and your earnings.
>
> **What stays visible.** Cloak's operator sees the sender, recipient and viewing key. The pool is small (about 3,000 notes), so amounts and timing can correlate; we use round amounts, a delay and one stealth wallet per position. The stealth wallet's trades are public, and the NEAR Intents route shows the destination address in its explorer. We claim unlinking, not anonymity.
>
> **Verify it.** Mainnet: shield `<sig>`, unshield to stealth `<sig>`, trade `<sig>`, resolve `<sig>`, payout `<sig>`.

English is safe: the same text can go into the Colosseum pitch, which must be in English.

### 8.3 Video storyboard (2:00)

0:00-0:15 a public wallet is a diary, and a bounty shows who is working. 0:15-0:40 the mainnet market resolves by
reading the chain. 0:40-1:20 Private mode: A shields, S receives from the pool (Solscan: A's history shows only a Cloak
deposit), S buys, the goal is met, resolve, redeem. 1:20-1:45 the exit (shielded ZEC or re-shield) and the viewing-key
CSV. 1:45-2:00 the honest limits and the links. Pre-stage the slow steps (the delay, proofs) and show their signatures.

### 8.4 Colosseum pack (English)

Register the team (Brazil location; Solana + Zcash); description, GTM and disclosures; public repo; pitch video 2-3 min;
demo <= 3 min; live mainnet link with "try it with $2" instructions; the same proof pack; Earn application for Trilha Brasil.

## 9. Risks

1. **Funding and time.** Nothing on mainnet starts without funds in A and D. Cut order in 6.1.
2. **Eligibility.** The/Garage membership is unknown. Submit anyway; the work feeds Colosseum regardless.
3. **Cloak can refuse or move.** Its authorizer signs every deposit and exit, and an upgrade is pending. Spike first and
   capture signatures early (they are permanent); re-smoke at 22:00. Fallback proof: a manual flow in the cloak.ag app.
4. **Fund loss through persistence.** Derive everything from M; write, fsync and reload before any deposit; single-note
   withdrawals only; caps in every script.
5. **Bun hangs in the prover.** Use Node + `tsx`; never run proofs under Bun.
6. **Privacy over-claim.** The small pool and the operator's visibility go in the text. Judges are ex-bankers; they will ask.
7. **Unaudited program holding real USDC.** Tiny amounts, UI caps, banner, README wording; no program-level cap today.
8. **1Click unknowns.** The SPL deposit path is untested, live quotes can be refused, minimum about 1.74 USDC, Zodl is
   mobile-only, docs are stale. Dry-run first, then a $5 live test.
9. **Repo hygiene.** It is private, 34 files are uncommitted, history was rewritten. Fix before submitting.
10. **Naming.** `NAMING.md` concluded that "Provable" collides with Aleo's Provable, which also ships a private-stablecoin
    wallet. A privacy-track judge will notice. Pick the visible name before recording the video.
11. **Public RPC limits.** Use a paid RPC for scripts and the app.
12. **Scope creep.** The cut order is the rule; the in-app UI is explicitly after the sprint.

## 10. Decisions and what only you can do

Decisions that change the plan: (1) the funding path: Path 1 (Cloak-only, about $20) or Path 2 (deploy, about $385 of
float, about $350 recoverable); (2) repo public, or private plus the three judges as collaborators, needed before the early
submit at about 17:00; (3) Zcash in today's entry or only for Colosseum; (4) the visible product name, needed before the final
video at about 21:00.

Only you can: fund the wallets; get the RPC key; connect X and copy the edit link; verify the/Garage status; install Zodl
and give me a unified address; make the repo public; register on Colosseum and Earn.

**Approvals I will ask for before doing them:** commit and push; make the repo public; generate keypairs; install
`tsx` and `@cloak.dev/sdk@0.2.5` (pinned); each spend phase with its cap; the mainnet deploy. No key is ever printed or read
by me (only public addresses), and no agent holds one.

## Appendix: artifacts from the research (session scratchpad, ephemeral; copy before use)

- `scratchpad/cloak-agent/proj/cloak-spike.ts`: Entry-leg spike, type-checked against the real 0.2.5 `.d.ts`, never run.
- `scratchpad/zcash-agent/kit/zcash-1click.ts`: ZIP-316/321 + 1Click module, `live` refuses without `--yes`.
- `scratchpad/submission-agent/`: captured Superteam form JS and site source, Copilot results.
- `scratchpad/cloak/`: raw Cloak docs exports. `scratchpad/colosseum/rules.pdf`: the official rules.
