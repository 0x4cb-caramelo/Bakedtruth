/**
 * Purpose: the error pages of spec 3.14 besides the 404: something broke on our side (500), with Baked tired and a
 *          way to try again, and offline, which retries by itself when the connection returns. Both say the SOL is
 *          safe on-chain. `#/error` shows the first, `#/error?kind=offline` the second.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Needs a route in router.js ("/error"); the 404 and the
 *          campaign that does not exist stay in not-found.js. Same layout as the 404 (.pg-404 in css/pages.css).
 */
const PAGES = {
  server: {
    title: "Something broke",
    heading: "Something broke on our side.",
    text: "Your SOL is on-chain; nothing on this page can move it. Try again in a moment.",
    action: "Try again",
    img: `<img src="img/baked-tired.webp" alt="" width="190" height="120" />`,
  },
  offline: {
    title: "Offline",
    heading: "You're offline.",
    text: "Campaigns, entries and payouts keep running on-chain. This page tries again when your connection returns.",
    action: "Retry now",
    img: "",
  },
};

export default () => {
  const kind = new URLSearchParams(location.hash.split("?")[1] ?? "").get("kind") === "offline" ? "offline" : "server";
  const p = PAGES[kind];
  return {
    title: p.title,
    html: `<section class="pg-404">${p.img}
      <h1 class="t-title">${p.heading}</h1>
      <p class="t-small">${p.text}</p>
      <p class="cluster"><button class="cta" type="button" data-retry><span>${p.action}</span></button><a class="btn" href="#/">See the campaigns</a></p>
    </section>`,
    mount(main) {
      const retry = () => location.reload();
      main.querySelector("[data-retry]").addEventListener("click", retry);
      if (kind === "offline") addEventListener("online", retry, { once: true });
      return () => removeEventListener("online", retry);
    },
  };
};
