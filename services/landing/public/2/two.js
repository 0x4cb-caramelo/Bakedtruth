/**
 * Purpose: the example campaign of the /2 draft. A visitor joins YES or NO, the example resolves as YES (SOL touched
 *          $300), and the card says what that side gets back. Nothing is sent or stored. The waitlist form is handled
 *          by the site's app.js.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-09
 *
 * The numbers: 3 SOL on YES, 7 on NO. YES wins: our fee is 10% of the losing side (0.7), the creator gets 1% of the
 * pot (0.1), and the 9.2 left go to YES, so 1 SOL on YES gets back 9.2 / 3, about 3.07 SOL.
 */
(function () {
  const OUTCOMES = {
    yes: {
      won: true,
      face: "/img/baked-approve.webp",
      text: "You joined YES. 1 SOL on YES gets back about 3.07 SOL.",
    },
    no: {
      won: false,
      face: "/img/baked-skeptical.webp",
      text: "You joined NO. Your SOL goes to the YES side.",
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    const demo = document.querySelector("[data-demo]");
    if (!demo) return;
    const sides = demo.querySelectorAll("[data-side]");
    const status = demo.querySelector("[data-demo-status]");
    const result = demo.querySelector("[data-demo-result]");
    const face = demo.querySelector("[data-demo-face]");
    const amount = demo.querySelector("[data-demo-amount]");
    sides.forEach((side) => side.setAttribute("aria-pressed", "false"));

    sides.forEach((side) => {
      side.addEventListener("click", () => {
        const outcome = OUTCOMES[side.dataset.side];
        sides.forEach((other) => other.setAttribute("aria-pressed", String(other === side)));
        demo.classList.add("is-picked");
        status.textContent = "The deadline passes. The program reads the Pyth price account.";
        result.hidden = false;
        result.classList.toggle("won", outcome.won);
        result.classList.toggle("lost", !outcome.won);
        face.src = outcome.face;
        amount.textContent = outcome.text;
      });
    });
  });
})();
