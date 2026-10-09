/**
 * Purpose: the campaign page, #/c/:id (spec 3.5; TP §3.6; S11–S12), in every state. Left: the header, the proof, the
 *          creator notice, the split and pot, the timeline, the re-check panel, the about rows, the share block and the
 *          report line. Right, sticky while it fits the window: the entry panel, or the state card once entries close,
 *          then "You're in". Under 860 px it is one column in the spec's phone order, moved in the DOM so reading order
 *          matches, and a bar at the bottom scrolls back to the panel. Unknown ids get the 404. Review switches in the
 *          hash: side, amount, fail, feed=stale, seal=band, open=summary|pending|confirmed|failed|share|report|recheck.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Sprint 11 builds it in app/features; Sprint 12 the states.
 */
import { byId } from "../data/index.js";
import { NOW, utc } from "../format.js";
import { joinable, result } from "../model.js";
import { state, toggleSaved } from "../state.js";
import { confirmed, demoLinks, failed, pending, summary } from "../ui/entry-flow.js";
import { draftFor, hashQuery, mountPanel, myEntry, panel } from "../ui/entry.js";
import { icon } from "../ui/icons.js";
import { closeDialog, dialog, menu, toast } from "../ui/layer.js";
import { chancePair } from "../ui/parts.js";
import { head, potBlock, timeline } from "./campaign-head.js";
import { proof, recheck } from "./campaign-proof.js";
import { about, creatorNotice, geoPanel, reportLink, shareBlock, statePanel, yourEntry } from "./campaign-state.js";
import notFound from "./not-found.js";

const DESK = { main: ["head", "proof", "creator", "pot", "time", "recheck", "about", "share", "report"], side: ["panel", "mine"] };
const PHONE = ["head", "pot", "panel", "mine", "proof", "creator", "time", "recheck", "about", "share", "report"];
let shown = ""; // the hash whose ?open= switch was already shown: a redraw must not show it again

function copy(text, what) {
  const done = () => toast(`${what[0].toUpperCase()}${what.slice(1)} copied.`, { kind: "ok" });
  const fail = () => toast("The browser blocked copying: select the text and copy it.", { kind: "warn" });
  try {
    navigator.clipboard.writeText(text).then(done, fail);
  } catch {
    fail();
  }
}

/** The Share menu (spec 3.5): a plain X intent link, no X script (K-10), and the link to copy. */
function share(c, anchor) {
  const url = `https://brot.markets/c/${c.id}`;
  const tail = joinable(c, NOW) ? `Entries close ${utc(c.entriesCloseAt)}.` : result(c) ? `Result: ${result(c)}.` : "Entries closed.";
  const x = `https://x.com/intent/tweet?text=${encodeURIComponent(`${c.sentence} ${tail} On Brot Markets (devnet).`)}&url=${encodeURIComponent(url)}`;
  menu(anchor, `<a role="menuitem" href="${x}" target="_blank" rel="noopener">${icon("external")}Post on X</a>
    <button role="menuitem" type="button" data-copy-link>${icon("copy")}Copy link</button>
    <a role="menuitem" href="#/card/${c.id}">${icon("eye")}Open the share card</a>`, (el, close) => {
    el.querySelector("[data-copy-link]").addEventListener("click", () => (close(), copy(url, "link")));
    el.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => close()));
  });
}

/** Where a report goes (C-10; the channel is L-13): X, with no form, so the site keeps nothing about it. */
function report(c) {
  const review = c.status === "review";
  dialog({
    title: review ? "Think this reading is wrong?" : "Report this campaign",
    body: `<div class="en-sheet">
      <p>${review ? `Tell the team before ${utc(c.reviewEndsAt)}, while the result is in review. The team can confirm it or void it; nobody can switch YES and NO.` : "Tell the team what looks wrong: a creator who can decide the result alone, a sentence that misleads, a copy of another campaign."}</p>
      <p>Write to <b>@brotmarkets</b> on X with the campaign's link. A reported campaign can be taken off the home page; it stays on-chain, resolves and pays. A report never changes its rules or its pot.</p>
      <p class="t-caption">This site keeps nothing about a report: there is no form.</p>
      <div class="en-actions"><button class="btn" type="button" data-copy-link>${icon("copy", 14)}Copy the link</button>
        <a class="cta" href="https://x.com/brotmarkets" target="_blank" rel="noopener"><span>Open @brotmarkets on X${icon("external", 14)}</span></a></div>
    </div>`,
    mount(body) {
      body.querySelector("[data-copy-link]").addEventListener("click", () => copy(`https://brot.markets/c/${c.id}`, "link"));
    },
  });
}

const joinBar = (c) => {
  const ch = chancePair(c);
  return `<div class="cp-joinbar" data-joinbar hidden><span>${ch ? `<b class="y">YES ${ch.yes}</b> · <b class="n">NO ${ch.no}</b>` : "No entries yet"}</span>
    <button class="cta" type="button" data-join><span>Join${icon("arrow-right", 15)}</span></button></div>`;
};

export default ({ id }) => {
  const c = byId(id);
  if (!c) return notFound({ id });
  const open = joinable(c, NOW);
  const side = open && state.geoBlocked ? geoPanel() : open ? panel(c) : statePanel(c);
  return {
    title: c.sentence,
    html: `<div class="cp">
      <div class="cp-cols">
        <div class="cp-main" data-col="main">${head(c)}${proof(c)}${creatorNotice(c)}${potBlock(c)}${timeline(c)}${recheck(c, { open: hashQuery().get("open") === "recheck" })}${about(c)}${shareBlock(c)}${reportLink(c)}</div>
        <div class="cp-side" data-col="side"><div class="cp-slot" data-block="panel">${side}</div>${yourEntry(c, myEntry(c))}</div>
      </div>${open && !state.geoBlocked ? joinBar(c) : ""}</div>`,
    mount: (main) => mount(main, c),
  };
};

function mount(main, c) {
  const root = main.querySelector(".cp");
  const at = (k) => root.querySelector(`[data-block="${k}"]`);
  const hooks = {
    onShare: () => share(c, root.querySelector("[data-share]")),
    onEdit: () => (at("panel").scrollIntoView({ block: "center" }), root.querySelector("[data-amount]")?.focus()),
    onMine: () => (at("mine")?.scrollIntoView({ block: "center" }), at("mine")?.focus()),
  };

  // One column under 860 px in the spec's phone order; nodes move, so the reading order follows what is seen.
  const mq = matchMedia("(max-width: 860px)");
  const arrange = () => {
    const [m, s] = ["main", "side"].map((k) => root.querySelector(`[data-col=${k}]`));
    const put = (col, keys) => keys.forEach((k) => at(k) && col.append(at(k)));
    if (mq.matches) put(m, PHONE);
    else (put(m, DESK.main), put(s, DESK.side));
    // On one column the line above the panel is short on the left: Baked stands on the right there.
    at("panel").querySelector('[data-perch="panel"]')?.setAttribute("data-perch-x", mq.matches ? "0.84" : "0.22");
  };
  arrange();
  mq.addEventListener("change", arrange);
  // The right column sticks only while it fits the window; taller, it scrolls with the page so nothing is cut off.
  const side = root.querySelector("[data-col=side]");
  const fit = () => side.classList.toggle("is-tall", side.offsetHeight > innerHeight - 100);
  const ro = new ResizeObserver(fit);
  ro.observe(side);
  addEventListener("resize", fit);

  mountPanel(at("panel"), c, (d) => summary(c, d, hooks));
  root.querySelector("[data-save]").addEventListener("click", () => toggleSaved(c.id));
  root.querySelectorAll("[data-share]").forEach((b) => b.addEventListener("click", () => share(c, b)));
  root.querySelectorAll("[data-report]").forEach((b) => b.addEventListener("click", () => report(c)));
  root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b.dataset.copy, b.dataset.what ?? "text")));
  root.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      root.querySelectorAll("[data-tab]").forEach((t) => t.setAttribute("aria-pressed", String(t === b)));
      root.querySelectorAll("[data-pane]").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
    }),
  );
  demoLinks(root);

  // Phone: the bar shows while the panel is off-screen, and hides while a field has focus (the keyboard is up).
  const bar = root.querySelector("[data-joinbar]");
  let io = null;
  if (bar) {
    let away = false;
    let typing = false;
    const show = () => (bar.hidden = !away || typing);
    io = new IntersectionObserver(([e]) => ((away = !e.isIntersecting), show()));
    io.observe(at("panel"));
    root.addEventListener("focusin", (e) => ((typing = e.target.matches("input")), show()));
    root.addEventListener("focusout", () => ((typing = false), show()));
    bar.querySelector("[data-join]").addEventListener("click", () => {
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      at("panel").scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
      at("panel").querySelector('[data-side][aria-pressed="true"]')?.focus({ preventScroll: true });
    });
  }

  // Review switches: show one state of the flow directly, once per address, after the router has moved focus.
  const q = hashQuery();
  const want = q.get("open");
  if (want && want !== "recheck" && shown !== location.hash) {
    shown = location.hash;
    const d = draftFor();
    const show = {
      summary: () => summary(c, d, hooks),
      pending: () => pending(c, d, hooks, { step: q.get("step") ?? "sent" }),
      confirmed: () => confirmed(c, d, { ...hooks, toast: false }),
      failed: () => failed(c, d, q.get("fail") ?? "rejected", hooks),
      share: () => share(c, root.querySelector("[data-share]")),
      report: () => report(c),
    }[want];
    if (show) setTimeout(show, 60);
  }
  return () => {
    mq.removeEventListener("change", arrange);
    removeEventListener("resize", fit);
    ro.disconnect();
    io?.disconnect();
    closeDialog();
  };
}
