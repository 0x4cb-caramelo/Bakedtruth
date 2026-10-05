// Direction N · Ledger² Light.
// Purpose: D's templates (from ../shared/ledger.js) plus the light/dark switch. Nothing else is new.
// Version: 0.1 · Phase 3 (Prototype Lab), 2026-10-03.
(() => {
  const { mount } = window.BakedApp;
  const L = window.BakedLedger;
  L.chrome();

  function detail(m, state) {
    return `
    ${L.back()}
    <div class="detail">
      <div>
        ${L.heading(m)}
        ${L.proof(m)}
        <section class="chart">
          <h3>YES price · ${m.yes}¢</h3>
          ${L.chart(m.history)}
        </section>
      </div>
      ${L.order(m, state)}
    </div>`;
  }

  // Theme: the <head> script has already applied the saved or requested one.
  const root = document.documentElement;
  const button = document.querySelector("[data-theme-toggle]");
  const label = () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    button.setAttribute("aria-label", `Switch to the ${next} theme`);
    button.title = `Switch to the ${next} theme`;
  };
  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("baked-theme", root.dataset.theme);
    } catch {
      // Private mode: the choice just does not persist.
    }
    label();
    // The dot field reads its colour when it draws; a resize makes it draw.
    dispatchEvent(new Event("resize"));
  });
  label();

  L.effects();
  window.BakedMosaic.mount({ slide: L.slide, upcoming: L.upcoming, closing: L.closing });
  window.BakedPet.init({ size: 84 });
  mount({ id: "N", card: L.card, detail });
})();
