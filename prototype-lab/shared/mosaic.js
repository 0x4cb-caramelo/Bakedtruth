// The home mosaic used by directions D–G: a carousel of trading markets on the left, then
// "Upcoming" and "Closing soon" stacked on the right. Each direction passes its own templates;
// this file only picks the data and runs the carousel.
//
// Markup hooks: data-role = mosaic | carousel | slides | dots | upcoming | closing,
// and buttons with data-mosaic="prev" | "next" (dots are generated with data-dot).
window.BakedMosaic = (() => {
  const { data } = window.BakedApp;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mount({ slide, upcoming, closing, interval = 5500, slides = 5, rows = 4, onShow }) {
    const root = document.querySelector('[data-role="mosaic"]');
    if (!root) return;
    const open = data.markets.filter((m) => !m.resolved);
    const trading = [...open].sort((a, b) => b.volume - a.volume).slice(0, slides);
    const soon = [...open].sort((a, b) => a.days - b.days || b.volume - a.volume).slice(0, rows);

    root.querySelector('[data-role="upcoming"]').innerHTML = data.upcoming.slice(0, rows).map(upcoming).join("");
    root.querySelector('[data-role="closing"]').innerHTML = soon.map(closing).join("");

    const carousel = root.querySelector('[data-role="carousel"]');
    const track = root.querySelector('[data-role="slides"]');
    const dots = root.querySelector('[data-role="dots"]');
    let index = 0;
    let timer = 0;

    const show = (n) => {
      index = (n + trading.length) % trading.length;
      track.innerHTML = slide(trading[index], index, trading.length);
      if (dots) {
        dots.innerHTML = trading
          .map(
            (m, k) =>
              `<button type="button" data-dot="${k}" aria-label="Show ${m.name}" aria-current="${k === index}"></button>`,
          )
          .join("");
      }
      if (onShow) onShow(trading[index], track);
    };
    const stop = () => clearInterval(timer);
    const play = () => {
      stop();
      if (!reduce) timer = setInterval(() => show(index + 1), interval);
    };

    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mosaic],[data-dot]");
      if (!b) return;
      show(b.dataset.dot !== undefined ? Number(b.dataset.dot) : index + (b.dataset.mosaic === "prev" ? -1 : 1));
      play();
    });
    // Hovering or focusing the carousel holds the current slide.
    carousel.addEventListener("pointerenter", stop);
    carousel.addEventListener("pointerleave", play);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", play);

    show(0);
    play();
  }

  return { mount };
})();
