# Privacy Policy

**Brot Markets** · Last updated: 10 October 2026

Most privacy policies are long because the company collects a lot. Ours is short because we don't. We need almost
nothing about you to run a campaign, so we keep almost nothing.

> **The crumb:** we don't knead your data. An email if you give it, a wallet address that's public anyway, and that's
> the whole loaf.

## The whole thing in 30 seconds

- **Waitlist:** your email, the date you joined, which version of the consent sentence you saw, and which form you
  used. Gone when you leave, or after 12 months; our host's server backups keep a copy for up to 30 days more.
- **Campaigns:** your wallet address and your entries. They live on Solana, which is public and permanent. We can't
  hide them or delete them, and neither can anyone else.
- **Devnet leaderboard:** public wallet addresses ranked by points, worked out from Solana in our server's memory. You
  can ask to leave it.
- **No** name, no ID, no password, no cookies, no analytics, no ads, no tracking pixels, no selling.

## 1. Who is responsible

Brot Markets is run by its founders, Bernardo Nery, Lucas Galvão and Ronaldo Pereira. A company is being set up, and
this page will name it when it exists. Contact: [gm@brot.markets](mailto:gm@brot.markets), or
[@brotmarkets](https://x.com/brotmarkets) on X.

## 2. What we collect, and why

### The waitlist

> **The crumb:** one email, one date, one version number, one form. Baked counted.

| What | Why | How long |
|---|---|---|
| Your email address | To tell you when markets open on devnet, and again when they open with real money, if they do | Until you leave, or 12 months after you joined, whichever comes first. Old rows are deleted automatically |
| The date and time you joined | To know when the 12 months end | Same |
| The version of the consent sentence you saw | To prove what you agreed to | Same |
| Which form you used | To know where the list came from | Same |

We ask for it on the form, and you give it by sending the form. That's your consent, and you can take it back at any
time by leaving the list. We don't sell, rent or share the list, and we use it for nothing else.

### Campaigns

> **The crumb:** the blockchain is a glass oven. Everyone can see what's inside.

| What | Why | How long |
|---|---|---|
| Your wallet address, and the campaigns you entered, opened or received from | Solana records them; it's how the program works. Our site reads them to show your entries, each campaign's activity and the devnet leaderboard. A campaign's page names the wallet that opened it and, on every kind but a price campaign, that wallet's own entries in it | On Solana: forever, and public |
| A copy of that public data, in our server's memory | So the site loads fast without asking Solana for everything every time, and to work out the leaderboard | Until the server restarts. It is never written to disk |

**Before your first entry, the site tells you this:** entries are public and permanent, anyone can see a wallet's
entries on-chain, and a wallet that enters on the side that wins can appear on the devnet leaderboard. If that matters
to you, use a wallet you don't use for anything else.

### The devnet leaderboard

> **The crumb:** points only count on devnet. They are not money.

While Brot Markets runs on devnet, the site ranks wallet addresses by points: one per campaign entered on the side
that won, once the result is final and its pot was split. It shows each ranked wallet's address, its points and how
many campaigns it entered. No amounts, no success rate, nothing else. We work it out on our server from what Solana
shows anyone, and keep it in memory, never on disk. The page finds your own line in your browser, so it never sends
your wallet to us. We do this on our legitimate interest in running a public test of the campaigns, and you can object
by leaving it.

If you ask to leave the leaderboard (section 5), we keep your wallet address in a short list on our server, so the
ranking leaves it out. It stays there until you ask to come back. Leaving the leaderboard doesn't hide your wallet
anywhere else: a campaign's page still shows its entries, as Solana does.

### Every visit

> **The crumb:** we look at your address for a minute to stop spam, then we forget it.

- **Your IP address** reaches our server because that's how the internet works. The waitlist forms use it for about
  one minute, in memory, to stop one machine from spamming them, on our legitimate interest in keeping them working.
  We don't write it to disk or to our logs.
- **Our logs** record counts and errors ("an email was added, total N"), never your email, your wallet or your IP.

### Your browser

The campaign site keeps a few notes in your browser's storage, on your device. It never sends them to us:

- whether you picked the light or dark theme;
- the name of the wallet app you connected last, so it can reconnect when you ask;
- the campaigns you saved;
- while an entry is on its way, a record of it (its wallet, campaign, side and amount), so trying again can't enter
  twice. It is deleted once the entry lands, or, the next time a campaign page opens, a day after it was refused or
  could no longer land;
- from the moment the page hands a campaign you open to your wallet, a record of it (its wallet, the campaign number
  drawn for it, the transaction's signature and expiry, and when it was saved), so trying again can't open it twice.
  It is deleted once the campaign opens or you refuse it in your wallet. If the opening failed or could no longer land,
  the record stays, so trying again reuses its number, until the next time you open the creation box a day or more
  after it was saved;
- for the open tab only, how many times the page reloaded to wait out an update of the program.

Clearing this site's data in your browser deletes all of these at once.

## 3. Who else touches your data

> **The crumb:** a few helpers, all named. No secret bakers.

- **Cloudflare** carries every request to our server. Like any network provider, it sees your IP address, the page you
  ask for and what you type into our forms, under its own [privacy policy](https://www.cloudflare.com/privacypolicy/).
  It keeps basic logs of these requests for up to 7 days. Cloudflare also tries to add
  its own visitor statistics to our pages; our site's security settings block that script, so nothing is measured.
- **Our server** is rented from Hostinger, in the United States. Only the services that run our sites, and the
  founders who manage the server, can read the waitlist file and the list of wallets that asked to leave the
  leaderboard. Hostinger's backups of the server hold both for up to 30 days.
- **Solana, and the wallet you choose** (Phantom or another), handle your transactions under their own rules. We don't
  control them.
- **The Solana RPC service** the campaign site reads the chain through (on devnet, Solana's public one,
  api.devnet.solana.com) sees your IP address, under its own rules. It also sees your wallet address whenever the page
  asks it about your wallet: your balance and your entries; a transaction you are about to sign, which the page tests
  first, and its progress after you sign; and, before you pay to open a campaign, your wallet's recent transactions.
  It sees the accounts you check in the creation box too.
- **X** carries what you send us there, such as a report about a campaign or a request to leave the leaderboard. It
  stays on X, under X's rules. Asking on X ties your X account to your wallet in our messages there, until we delete
  the conversation once your request is done.
- **An email service** will be needed to send the "we're open" email. We haven't picked one. This page will name it
  before the first email goes out.

Our server and X are in the United States, Cloudflare's network is worldwide, and the RPC service may be outside your
country too, so your data leaves your country.
We'll give data to the authorities only when the law requires it. There isn't much to give.

## 4. What we don't do

No cookies. No analytics. No ads, and no advertising partners. No tracking pixels in emails. No buying data about you
from anyone. No profiles beyond the devnet leaderboard, which shows a wallet's points and how many campaigns it
entered, nothing more, and which you can leave. No selling, renting or "sharing with partners". No artificial
intelligence trained on your data.

## 5. Your rights

> **The crumb:** ask, and you'll get it. Usually in a single slice.

Depending on where you live (for example under the LGPD in Brazil or the GDPR in Europe), you can ask us to show you,
correct, export or delete your data, or to stop using it. Ask at [gm@brot.markets](mailto:gm@brot.markets) or on X;
we answer every request within 15 days. In practice:

- **Leave the waitlist:** type your email at brot.markets/privacy. It is deleted from the list at once. We keep no
  other copy, but our host's backups of the server can hold it for up to 30 days more, and then it's gone.
- **A copy of your waitlist record:** ask us (section 1). It's four fields; we'll send them.
- **Leave the devnet leaderboard:** send us a direct message on X. We'll ask your wallet to sign a short message, to
  confirm the wallet is yours, then leave it out of the ranking and delete our conversation once it's done.
- **Your activity on Solana** can't be deleted, by us or by anyone. Our copy of it lives only in memory and is rebuilt
  from Solana, so there's nothing of it on disk to delete.
- **Complain to a data protection authority** in your country, like the ANPD in Brazil, if you think we got it wrong.
  We'd like to hear it first, though.

## 6. Security

The waitlist file and the list of wallets that asked to leave the leaderboard can only be read by the services that
run our sites and the founders who manage the server. There's no admin panel and no page that lists the emails. The
form answers the same way whether or not an email is on the list, so nobody can use it to find out who signed up. If
we ever have a breach that affects you, we'll tell you and the authorities as the law requires.

## 7. Age

Brot Markets is for adults, 18 and over. If you're under 18, please don't join the waitlist. If we learn that someone
under 18 did, we delete it.

## 8. Changes

If we start collecting anything new, this page changes **before** we do it, with a new date at the top and a post on
X. If the change needs your consent, we'll ask for it. We won't just assume you said yes.

---

That's it. If it felt short, that's because it is. Baked prefers it that way.
