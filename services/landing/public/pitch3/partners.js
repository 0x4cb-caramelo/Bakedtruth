/**
 * Purpose: the launch partners counter of the Growth slide of /pitch3: two seconds after the slide arrives the number
 *          climbs to the partners already signed, their logos come in at the same pace, and the last four fan out.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * PARTNERS is the list. It is empty until a partner has signed and agreed to be shown: while it is empty the card
 * keeps its plain sentence. An entry is { name: "Project", logo: "project.webp" }, with the file in img/partners/.
 * No invented partner goes in here, not even as a placeholder.
 */
export const PARTNERS = [];
const SPOTS = 30;

function logo(partner) {
  const img = document.createElement("img");
  img.alt = partner.name;
  img.title = partner.name;
  img.src = new URL(`img/partners/${partner.logo}`, import.meta.url).href;
  img.className = "g-logo";
  return img;
}

/** `animate` false shows the final state at once: the count, and the last four logos fanned out. */
export function partners(stage, slide, { animate = true, list = PARTNERS } = {}) {
  const card = slide.querySelector("[data-partners]");
  if (!card || !list.length) return;
  const text = card.querySelector("[data-partners-text]");
  const row = card.querySelector("[data-partners-logos]");
  const before = Array.from(text.childNodes, (node) => node.cloneNode(true));
  stage.keep({
    remove: () => {
      text.replaceChildren(...before);
      row.replaceChildren();
      row.classList.remove("is-fanned");
    },
  });
  const count = document.createElement("b");
  text.replaceChildren(count, ` of ${SPOTS} launch spots taken.`);
  const show = (n) => {
    count.textContent = String(n);
    if (n > 0) row.append(logo(list[n - 1]));
    // Only the last four stay on the card.
    while (row.children.length > 4) row.firstElementChild.remove();
  };
  if (!animate) {
    for (let n = Math.max(0, list.length - 4); n <= list.length; n++) show(n);
    count.textContent = String(list.length);
    row.classList.add("is-fanned");
    return;
  }
  show(0);
  const pace = Math.min(260, Math.max(60, 1400 / list.length));
  list.forEach((_, i) => stage.later(() => show(i + 1), 2000 + i * pace));
  stage.later(() => row.classList.add("is-fanned"), 2000 + list.length * pace + 150);
}
