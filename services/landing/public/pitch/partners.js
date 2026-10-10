/**
 * Purpose: the launch partners counter of the Growth slide of /pitch: two seconds after the slide arrives the number
 *          climbs to the partners in the list, their logos come in at the same pace, the number starts to glow and
 *          the last four logos fan out.
 * Version: 0.3.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * PARTNERS is the list. Today it holds seven FICTITIOUS brands the founder drew (docs/product/poses/fic_partners),
 * so the animation can be seen and judged; while any entry is an example the card says "example", because a count
 * of partners is a claim about the business and these are not partners. A real entry is
 * { name: "Project", logo: "project.webp" }, with the file in img/partners/, added only when that partner has signed
 * and agreed to be shown. Remove the fictitious ones then.
 */
const FICTITIOUS = ["vaultide", "meshora", "lumint", "swaploom", "orbynd", "zkrove", "chainquill"];
const example = (brand, i) => ({
  name: `${brand[0].toUpperCase()}${brand.slice(1)} (fictitious)`,
  logo: `fic-0${i + 1}-${brand}.webp`,
  example: true,
});
export const PARTNERS = FICTITIOUS.map(example);
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
  const tag = card.querySelector("[data-partners-tag]");
  const before = Array.from(text.childNodes, (node) => node.cloneNode(true));
  stage.keep({
    remove: () => {
      text.replaceChildren(...before);
      row.replaceChildren();
      row.classList.remove("is-fanned");
      if (tag) tag.hidden = true;
    },
  });
  if (tag) tag.hidden = !list.some((partner) => partner.example);
  const count = document.createElement("b");
  text.replaceChildren(count, ` of ${SPOTS} launch spots taken.`);
  const show = (n) => {
    count.textContent = String(n);
    if (n > 0) row.append(logo(list[n - 1]));
    // Only the last four stay on the card.
    while (row.children.length > 4) row.firstElementChild.remove();
  };
  const settle = () => {
    count.classList.add("glow");
    row.classList.add("is-fanned");
  };
  if (!animate) {
    for (let n = Math.max(0, list.length - 4); n <= list.length; n++) show(n);
    return settle();
  }
  show(0);
  const pace = Math.min(260, Math.max(60, 1400 / list.length));
  list.forEach((_, i) => stage.later(() => show(i + 1), 2000 + i * pace));
  stage.later(settle, 2000 + list.length * pace + 150);
}
