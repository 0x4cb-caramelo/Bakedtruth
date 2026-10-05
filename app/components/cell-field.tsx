"use client";

// Background grid: cells light up under the pointer and fade out in steps. One fixed canvas,
// redrawn only while something is lit.

import { useEffect, useRef } from "react";

const CELL = 32;

export function CellField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const lit = new Map<string, number>();
    let running = false;
    let raf = 0;

    const paint = () => {
      const w = innerWidth;
      const h = innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(106,168,255,.05)";
      for (let x = 0; x < w; x += CELL) ctx.fillRect(x, 0, 1, h);
      for (let y = 0; y < h; y += CELL) ctx.fillRect(0, y, w, 1);
      for (const [key, v] of lit) {
        const [cx, cy] = key.split(",").map(Number);
        ctx.fillStyle = `rgba(106,168,255,${(Math.ceil(v * 5) / 5) * 0.2})`;
        ctx.fillRect(cx! * CELL + 1, cy! * CELL + 1, CELL - 1, CELL - 1);
        if (v <= 0.03) lit.delete(key);
        else lit.set(key, v - 0.03);
      }
      running = lit.size > 0;
      if (running) raf = requestAnimationFrame(paint);
    };

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType === "touch") return;
      const cx = Math.floor(e.clientX / CELL);
      const cy = Math.floor(e.clientY / CELL);
      lit.set(`${cx},${cy}`, 1);
      if (Math.random() < 0.5)
        lit.set(`${cx + (Math.random() < 0.5 ? -1 : 1)},${cy + (Math.random() < 0.5 ? -1 : 1)}`, 0.5);
      if (!running) {
        running = true;
        raf = requestAnimationFrame(paint);
      }
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", paint);
    paint();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", paint);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
