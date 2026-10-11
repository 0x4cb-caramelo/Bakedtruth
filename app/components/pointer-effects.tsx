/**
 * Purpose: the approved prototype's pointer effects (prototype-lab/campaigns/js/effects.js, whose styles came over in
 *          base.css and card.css): the dot field behind every page, which brightens around the pointer, and the
 *          spotlight that follows the pointer across the campaign grid. The dots are drawn only when the pointer
 *          moves, the window resizes or the theme changes, in the colour of --dot-rgb; with prefers-reduced-motion
 *          they stay still and the spotlight is off. Decoration only: hidden from assistive technology, never in the
 *          way of a click, and nothing is read or sent. (The prototype's third effect, the top bar's border once the
 *          page scrolls, is site-header.tsx's.)
 * Version: 0.1.0
 * Sprint:  09 (site shell), in the UI overhaul
 */
"use client";

import { useEffect, useRef } from "react";

/** The prototype's grid, in CSS px, and how far the pointer lights it. */
const GAP = 24;
const REACH = 190;

type Point = { x: number; y: number };

function paint(canvas: HTMLCanvasElement, pointer: Point, still: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rgb = getComputedStyle(document.documentElement).getPropertyValue("--dot-rgb").trim() || "163, 172, 186";
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const [w, h] = [window.innerWidth, window.innerHeight];
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) [canvas.width, canvas.height] = [w * dpr, h * dpr];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  for (let y = GAP / 2; y < h; y += GAP) {
    for (let x = GAP / 2; x < w; x += GAP) {
      const near = still ? 0 : Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / REACH);
      ctx.fillStyle = `rgba(${rgb},${0.07 + near * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + near * 1.2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

/** Every card of the grid under the pointer follows it with --mx and --my; card.css draws the light. */
function spotlight(e: PointerEvent) {
  const grid = e.target instanceof Element ? e.target.closest(".grid-cards") : null;
  if (!grid) return;
  for (const card of grid.children) {
    const r = card.getBoundingClientRect();
    (card as HTMLElement).style.setProperty("--mx", `${e.clientX - r.left}px`);
    (card as HTMLElement).style.setProperty("--my", `${e.clientY - r.top}px`);
  }
}

export function PointerEffects() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pointer: Point = { x: -999, y: -999 };
    let frame = 0;
    const draw = () => {
      frame = 0;
      paint(canvas, pointer, reduce.matches);
    };
    // One drawing per frame, however many moves arrive in it.
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      queue();
      if (!reduce.matches) spotlight(e);
    };
    // The theme switch rewrites data-theme on <html>: the dots take the new --dot-rgb.
    const theme = new MutationObserver(queue);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", queue);
    reduce.addEventListener("change", queue);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      theme.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", queue);
      reduce.removeEventListener("change", queue);
    };
  }, []);
  return <canvas id="dots" ref={ref} aria-hidden="true" />;
}
