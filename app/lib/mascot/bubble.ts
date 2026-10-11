// Purpose: keeps the mascot's speech bubble inside the screen (Sprint 13 DoD: on phones the bubble does not cut). The
// bubble is centred over the mascot; near an edge it shifts sideways by just enough to stay `margin` px inside, through
// the `--say-shift` property the stylesheet adds to its centring. Browser-only, free of React.
// Sprint: 13 (site: ranking, notices and copy)

/** Measures the shown bubble and shifts it back inside the viewport. */
export function fitBubble(bubble: HTMLElement, margin = 8): void {
  bubble.style.setProperty("--say-shift", "0px");
  const r = bubble.getBoundingClientRect();
  let dx = 0;
  if (r.width > innerWidth - 2 * margin) dx = margin - r.left;
  else if (r.left < margin) dx = margin - r.left;
  else if (r.right > innerWidth - margin) dx = innerWidth - margin - r.right;
  bubble.style.setProperty("--say-shift", `${Math.round(dx)}px`);
}
