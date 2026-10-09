/**
 * Purpose: the share card (#/card/:id), the 1200 × 630 image an X post shows for a campaign (/c/[id]/opengraph-image):
 *          before the result, the sentence, the live value against the target, the YES/NO split, the pot and both
 *          moments; after it, the result, the value read and the target. The page shows the image scaled to fit,
 *          with the post, the alt text and the other states; `?frame=1` draws only the image, as the route would.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Spec 3.13; TP §3.6; BR-33. The image is always dark
 *          (spec 3.13), so the page loads it in a frame with ?theme=dark: tokens alone can't be dark in a light page.
 */
import { byId } from "../data/index.js";
import { esc, LAMPORTS, NOW, pct, utc, value } from "../format.js";
import { pot, result, STATES } from "../model.js";
import { voidReason } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { chancePair, kindLabel, kindTile, seal, splitBar } from "../ui/parts.js";
import notFound from "./not-found.js";

const OTHERS = [["Open", "8231904417"], ["Partner", "1093327781"], ["In review", "4419928305"], ["Paid YES", "6650183342"], ["Paid NO", "8813370026"], ["Voided", "5039917762"]];
/** The image rounds SOL to two decimals (spec 3.13's "Pot 93.87 SOL"): a picture is read small, in a feed. */
const solShort = (lamports) => value(lamports / LAMPORTS, "SOL");
const day = (ts) => utc(ts).split(" · ")[0];
const stateText = (c) => (c.status === "paid" ? `Paid · ${result(c)}` : STATES[c.status].label);
const alt = (c) => `${c.sentence} — ${stateText(c)}, ${chancePair(c) ? `YES ${chancePair(c).yes}` : "no entries yet"}, pot ${solShort(pot(c).total)}.`;
const val = (label, v, cls = "") => `<div><small>${esc(label)}</small><b class="num ${cls}">${v}</b></div>`;

/** Where the campaign stands, under the result. */
const after = (c) =>
  ({
    review: () => `In review · pays at ${utc(c.reviewEndsAt)}`,
    contested: () => "In review · contested, payout paused",
    paid: () => (c.settleMode === "onesided" ? "One-sided: every entry refunded" : `Paid · ${c.bakers} bakers`),
    void: () => `Every entry refunded · ${voidReason(c)}`,
  })[c.status]?.() ?? "";

/** The image itself, 1200 × 630, from the campaign's public fields only. */
function image(c) {
  const ch = chancePair(c);
  const done = ["review", "contested", "paid", "void"].includes(c.status);
  const target = `${c.direction === "below" ? "≤" : "≥"} ${value(c.target, c.unit)}`;
  const middle = !done
    ? `<div class="sc-vals">${val(`${c.field} now`, c.live ? value(c.live.value, c.unit) : "No reading")}${val("YES if", target, "dim")}</div>`
    : `<p class="sc-result ${c.status === "void" ? "void" : c.outcome}">${c.status === "void" ? "Voided" : `Result: ${result(c)}`}</p>
       <div class="sc-vals">${c.observed ? val(c.observed.label, value(c.observed.value, c.unit)) : ""}${val("Target", target, "dim")}</div>`;
  return `<div class="sc">
    <div class="sc-main">
      <p class="sc-kind">${kindTile(c)}<span><b>${kindLabel(c)}</b> · ${esc(c.asset)}</span>${seal(c)}</p>
      <p class="sc-sentence${done || c.sentence.length > 52 ? " long" : ""}">${esc(c.sentence)}</p>
      ${middle}
      <p class="sc-when">${done ? after(c) : `Deadline ${utc(c.deadlineAt)}`}</p></div>
    <div class="sc-side">
      <p class="sc-pot"><small>Pot</small><b class="num">${solShort(pot(c).total)}</b>${pot(c).prize ? `<span>with a ${solShort(pot(c).prize)} prize, on no side</span>` : ""}</p>
      ${ch ? `<div class="sc-chance"><span class="y"><small>YES</small><b class="num">${ch.yes}</b></span><span class="n"><small>NO</small><b class="num">${ch.no}</b></span></div>`
        : `<p class="sc-none">No entries yet</p>`}
      ${splitBar(c, { legend: false })}
      <p class="sc-close">${c.status === "open" && ch && (!c.poolYes || !c.poolNo) ? "One-sided so far · " : ""}Entries ${c.entriesCloseAt > NOW ? "close" : "closed"} ${day(c.entriesCloseAt)}</p></div>
    <div class="sc-bar"><span class="sc-brand">brot<b>.markets</b></span><span class="mono">/c/${esc(c.id)}</span>
      <span class="sc-devnet">Devnet · test SOL, worth nothing</span>
      <img src="img/baked-${c.status === "void" ? "tired" : done ? "approve" : "deadpan"}.webp" alt="" width="188" height="120"></div>
  </div>`;
}

export default ({ id }) => {
  const c = byId(id);
  if (!c) return notFound({ id });
  if (new URLSearchParams(location.hash.split("?")[1] ?? "").get("frame") === "1")
    return {
      title: "Share card image",
      html: `<h1 class="sr-only">${esc(alt(c))}</h1>${image(c)}`,
      mount() {
        document.documentElement.classList.add("sc-only");
        return () => document.documentElement.classList.remove("sc-only");
      },
    };
  const link = `https://brot.markets/c/${c.id}`;
  const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(c.sentence)}&url=${encodeURIComponent(link)}`;
  return {
    title: "Share card",
    html: `<div class="page-head"><div><p class="t-kicker">Share card · /c/${esc(c.id)}/opengraph-image</p><h1 class="t-title">Share card</h1>
      <p class="pg-lead">The image an X post shows for this campaign. Every campaign has a card to post on X: it invites, it's never a condition.</p></div></div>
    <div class="pg">
      <figure class="sc-figure" role="img" aria-label="${esc(alt(c))}">
        <div class="sc-stage" data-stage><iframe class="sc-view" src="./?theme=dark#/card/${esc(c.id)}?frame=1" width="1200" height="630" title="Share card image" inert tabindex="-1"></iframe></div>
        <figcaption class="pg-note" aria-hidden="true"><span data-scale>1200 × 630 px</span> · always in the dark theme · drawn only from the campaign's public data, never from text in a link</figcaption>
      </figure>
      <div class="pg-two">
        <section class="panel"><h2 class="panel-head">${icon("share")}The post</h2>
          <p class="sc-post">${esc(c.sentence)} <span class="mono">${link}</span></p>
          <p class="cluster"><a class="cta" href="${intent}" target="_blank" rel="noopener"><span>Post on X${icon("external", 14)}</span></a><a class="btn" href="#/c/${esc(c.id)}">Open the campaign</a>
            <a class="btn quiet" href="./?theme=dark#/card/${esc(c.id)}?frame=1" target="_blank" rel="noopener">The image alone</a></p>
          <p class="t-small">A plain link to X, with no X script on any page.</p></section>
        <section class="panel"><h2 class="panel-head">${icon("eye")}Alt text</h2><p class="sc-alt">${esc(alt(c))}</p>
          <h2 class="panel-head">${icon("grid")}The card in other states</h2>
          <ul class="pg-links">${OTHERS.map(([t, x]) => `<li><a href="#/card/${x}"${x === c.id ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul></section>
      </div></div>`,
    mount(main) {
      const stage = main.querySelector("[data-stage]");
      const label = main.querySelector("[data-scale]");
      const fit = () => {
        const k = Math.min(1, stage.clientWidth / 1200);
        stage.style.setProperty("--k", k);
        label.textContent = `1200 × 630 px, the size X shows, here at ${pct(k)}`;
      };
      const watch = new ResizeObserver(fit);
      watch.observe(stage);
      fit();
      return () => watch.disconnect();
    },
  };
};
