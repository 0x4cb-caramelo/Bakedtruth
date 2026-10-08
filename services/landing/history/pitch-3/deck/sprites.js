/**
 * Purpose: the mascot images of /pitch3: which file is which pose, loading them ahead of time, and putting a pose
 *          on a slide at a place given in the slide's own 1920 x 1080 coordinates.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-07
 *
 * The drawings are the founder's (docs/product/poses, the LEIA-ME there explains each one). Every frame is 1200 x 800
 * with the feet on the last row; the side poses look to the right and are flipped here when the mascot faces left.
 */
const FILES = {
  front: "e01-neutro",
  fullSticker: "e09-adesivo-cheio",
  emptySticker: "01-adesivo-vazio",
  fall: "02-caindo",
  runA: "03-correndo-frente",
  runB: "04-correndo-tras",
  grab: "05-agarrando-slide",
  pull: "06-puxando-slide",
  hang: "07-pendurado-um-braco",
  drop: "08-soltando-no-ar",
  pointA: "09-braco-meio-caminho",
  pointB: "10-apontando",
  pointC: "11-apontando-enfase",
  bite: "12-mordendo",
  chew: "13-mastigando",
  loaf: "14-pao-inteiro",
  loafBitten: "15-pao-mordido",
  ropeGrab: "16-agarrando-corda-cortina",
  ropePull: "17-puxando-corda-cortina",
};

export const url = (name) => new URL(`img/${FILES[name]}.webp`, import.meta.url).href;

/** Asks for every pose now, so no scene shows an empty frame while an image arrives. */
export function preload() {
  for (const name of Object.keys(FILES)) new Image().src = url(name);
}

/** Where `el` is inside `slide`, in the slide's own coordinates, whatever the scale on screen. */
export function place(el, slide) {
  const s = slide.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = 1920 / s.width;
  return { x: (r.left - s.left) * k, y: (r.top - s.top) * k, w: r.width * k, h: r.height * k };
}

/**
 * The same, read from the layout and not from the screen: right even while the slide is still sliding in.
 * Works for what is laid out inside the slide (not for what a scene has moved with a transform).
 */
export function spot(el, slide) {
  let x = 0;
  let y = 0;
  for (let node = el; node && node !== slide.parentElement; node = node.offsetParent) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * Adds a pose to the slide: a box, which scenes move, holding the image, flipped when the mascot faces left.
 * `x` and `y` are the top left corner of the frame and `h` its height, in the slide's coordinates.
 */
export function sprite(slide, name, { x, y, h, flip = false, z = 20 }) {
  const box = document.createElement("div");
  box.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${h * 1.5}px;height:${h}px;z-index:${z};pointer-events:none;transform-origin:50% 100%;`;
  const img = document.createElement("img");
  img.alt = "";
  img.src = url(name);
  img.style.cssText = `width:100%;height:100%;display:block;image-rendering:pixelated;${flip ? "transform:scaleX(-1);" : ""}`;
  box.append(img);
  slide.append(box);
  return { box, img, show: (pose) => (img.src = url(pose)) };
}

/** Alternates the two running frames on `img`. Returns the function that stops it. */
export function running(stage, img, ms = 120) {
  let step = 0;
  return stage.every(() => (img.src = url(step++ % 2 ? "runA" : "runB")), ms);
}
