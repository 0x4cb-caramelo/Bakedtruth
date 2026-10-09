/**
 * Purpose: the public record (#/record): the keys by role and address (never by person), every power with who holds
 *          it and its limit in code (TP §3.4.9), said plainly that the upgrade key can replace the unaudited program,
 *          and the log of voids and pauses with their reasons, signers and where each opening fee went. `?empty=1`
 *          shows the log with no voids.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.11; BR-41, BR-45. Sprints 12 and 13. The key
 *          addresses are mock (spec 6.4, plus an invented company key); content/powers.md holds the real ones.
 */
import { CAMPAIGNS } from "../data/index.js";
import { esc, short, sol, utc } from "../format.js";
import { icon } from "../ui/icons.js";
import { toast } from "../ui/layer.js";
import { stateChip } from "../ui/parts.js";
import { voidReason } from "../ui/card.js";

const KEYS = {
  company: "DemoAdmin9Kq2Rt5Wv8Xy3Zb6Cd1Ef4Gh7Jk2Mn5Np",
  team: ["DemopvP57fsNy3HvBGLbXEEfVSTPeBMQKuJkB3sPizbE", "DemobN557Us23myBw6DTp7tW3AS8wQiiDC9fFUBYordr"],
  fees: "DemohEG5bVeiFVc8XVJqfRmMATdG92MQUTKi7hxo28Rq",
};
const addr = (a) => `<span class="mono" title="${a}">${short(a)}</span>`;
const CODES = { "missed-window": "MissedWindow", unreadable: "UnreadableAccount", "stale-feed": "StaleFeed", "team-house": "TeamHouseFailure", "team-outside": "TeamOutsideCause" };
const HOUSE = ["missed-window", "team-house"];

const ROLES = [
  ["Admin", [KEYS.company], "Resumes after a pause; sets creation parameters for future campaigns, the team keys and the fee recipient; decides a contest. On devnet, a company key kept on the team's own machines, never on a server."],
  ["Team keys", KEYS.team, "Held by the founders. Pause; confirm or void a result in review; open a contest; open free for the team or a launch partner."],
  ["Upgrade authority", [KEYS.company], "Can replace the program's code. On devnet it is the same company key as the admin."],
  ["Anyone", [], "Any wallet. Opens a campaign by paying, and can trigger resolution, payouts and the fee sweep, choosing no amount and no destination."],
  ["Baker", [], "A wallet that joined. Its entry is recorded in its name, and only the program pays it out."],
  ["Creator", [], "The wallet that opened. Gets 1% of the entries when both sides have some. On burn, lock, stake pool and validator campaigns it may control the result and may have an entry."],
];

const POWERS = [
  ["Pause entries and openings", "One team key", "Stops new entries and openings only. Results, reviews, payouts and refunds keep running."],
  ["Resume", "The admin", "Lifts the pause."],
  ["Change creation parameters", "The admin", "Future campaigns only, inside ceilings written in the code. An open campaign's fees never change."],
  ["Confirm or void a result", "One team key", "Only while it is in review, inside the 6-hour window. Never switches YES and NO."],
  ["Open a contest", "One team key", "Pauses the payout. A second read within 1 hour; if it differs, the admin confirms or voids within 48 hours."],
  ["Change the team keys, the fee recipient or the admin", "The admin", "The admin key itself changes in two steps."],
  ["Open a campaign without paying", "One team key", "For the team or a launch partner: no prize, no creator share. Every such opening raises an alert."],
  ["Open a campaign", "Any wallet", "Pays US$500 in SOL. Five kinds, an account the program can read, 3 to 90 days, fees fixed by the program."],
  ["Resolve, settle and pay", "Any wallet", "Chooses nothing: the result comes from the account read, the amounts and destinations from the program."],
  ["Move Brot's fees", "Any wallet", `Only to the fee recipient, ${addr(KEYS.fees)}.`],
  ["Move or take a baker's entry", "Nobody", "No instruction does it, and there is no emergency withdrawal.", "nobody"],
  ["Replace the program", "The upgrade authority", "On devnet, at any time. A replaced program could do what this table rules out.", "upgrade"],
];

const PAUSE = { at: Date.UTC(2026, 9, 2, 9, 12), minutes: 28 };

function voidItem(c) {
  const house = HOUSE.includes(c.voidReason);
  return `<li class="pg-log-item">
    <div class="pg-log-when"><time datetime="${new Date(c.deadlineAt).toISOString()}">${utc(c.deadlineAt)}</time>${stateChip(c)}</div>
    <div class="pg-log-body"><a href="#/c/${c.id}">${esc(c.sentence)}</a>
      <p class="pg-log-why"><b>${voidReason(c)}</b><span class="mono">${CODES[c.voidReason]}</span></p>
      <blockquote>${esc(c.voidNote)}</blockquote>
      <dl class="pg-facts"><div><dt>Signer</dt><dd>${c.voidReason.startsWith("team-") ? `Team key ${addr(KEYS.team[0])}` : "Automatic, at resolution"}</dd></div>
        <div><dt>Entries</dt><dd>${sol(c.poolYes + c.poolNo)} refunded to ${c.bakers} bakers</dd></div>
        <div><dt>Opening fee</dt><dd>${house ? "Refunded" : "Kept"}: ${sol(c.openingFee)} · ${house ? "our failure" : "outside cause"}</dd></div>
        <div><dt>Transaction</dt><dd><a href="#" data-explorer>View on explorer${icon("external", 12)}</a></dd></div></dl></div></li>`;
}

const pauseItem = () => `<li class="pg-log-item">
    <div class="pg-log-when"><time datetime="${new Date(PAUSE.at).toISOString()}">${utc(PAUSE.at)}</time><span class="chip">${icon("pause", 11)}Paused</span></div>
    <div class="pg-log-body"><p class="pg-log-why"><b>Entries and new campaigns paused</b></p>
      <blockquote>Paused by a team key and resumed by the admin ${PAUSE.minutes} minutes later. Payouts and refunds kept running.</blockquote>
      <dl class="pg-facts"><div><dt>Paused by</dt><dd>Team key ${addr(KEYS.team[0])}</dd></div><div><dt>Resumed by</dt><dd>The admin, ${addr(KEYS.company)}</dd></div>
        <div><dt>Transaction</dt><dd><a href="#" data-explorer>View on explorer${icon("external", 12)}</a></dd></div></dl></div></li>`;

export default () => {
  const none = new URLSearchParams(location.search).get("empty") === "1";
  const voids = none ? [] : CAMPAIGNS.filter((c) => c.status === "void").sort((a, b) => b.deadlineAt - a.deadlineAt);
  return {
    title: "Who can do what",
    html: `<div class="page-head"><div><p class="t-kicker">Record</p><h1 class="t-title">Who can do what</h1>
      <p class="pg-lead">Every key that can act on the program, what it can do and the limit written in the code. Then every void and pause, with its reason.</p></div></div>
    <div class="pg">
      <section class="pg-sec" aria-labelledby="pg-keys"><h2 class="t-section" id="pg-keys">The keys</h2>
        <ul class="pg-roles" role="list">${ROLES.map(([role, keys, text]) => `<li class="panel"><h3 class="t-h3">${role}</h3>
          ${keys.length ? `<p class="pg-keys">${keys.map(addr).join("")}</p>` : ""}<p>${text}</p></li>`).join("")}</ul></section>
      <section class="pg-sec" aria-labelledby="pg-powers"><h2 class="t-section" id="pg-powers">Every power and its limit</h2>
        <div class="pg-tbl pg-pw" role="table" aria-label="Powers, who holds them and their limits">
          <div class="pg-tr pg-th" role="row"><span role="columnheader">Power</span><span role="columnheader">Who</span><span role="columnheader">Limit in code</span></div>
          ${POWERS.map(([p, who, limit, cls = ""]) => `<div class="pg-tr ${cls}" role="row"><span role="cell"><b>${p}</b></span>
            <span role="cell" data-k="Who">${cls === "nobody" ? `<span class="chip pg-nobody">${icon("lock", 11)}${who}</span>` : who}</span><span role="cell" data-k="Limit">${limit}</span></div>`).join("")}</div>
        <div class="pg-plain" role="note" data-perch="plain" data-perch-x="0.97" data-perch-size="0.8" data-perch-pose="deadpan" data-perch-say="Nobody. Not even the team.">${icon("alert", 18)}<p><b>Said plainly:</b> the program is not audited, and on devnet its upgrade authority can replace it at any time. On mainnet, the admin and the upgrade authority move to a 2-of-3 multisig on hardware devices, and an upgrade waits 24 to 48 hours in public before it takes effect.</p></div></section>
      <section class="pg-sec" aria-labelledby="pg-log"><h2 class="t-section" id="pg-log">Voids and pauses</h2>
        <p>Each void's reason code is recorded on-chain; its text is published here. A void returns every entry in full.</p>
        ${voids.length ? `<ol class="pg-log" role="list">${voids.map(voidItem).join("")}${pauseItem()}</ol>` : `<p class="pg-none">No voids yet.</p>`}</section>
    </div>`,
    mount(main) {
      main.querySelectorAll("[data-explorer]").forEach((a) =>
        a.addEventListener("click", (e) => (e.preventDefault(), toast("The explorer opens in a new tab on the real site."))),
      );
    },
  };
};
