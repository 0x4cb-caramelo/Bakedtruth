/**
 * Purpose: the chance history (L-23): the YES share of the entries after each entry, as a step line (a share changes only
 *          when an entry goes in), one series in the design's YES colour, 0–100% on one axis with a recessive 50% line,
 *          the last value labelled at its end, and a crosshair with a readout on hover and on keyboard focus (arrow
 *          keys). The recent entries listed beside it are the table view, so nothing is reachable only by hovering.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useState } from "react";

import { ACTIVITY } from "./copy";

const W = 600;
const H = 170;
const PAD = { left: 40, right: 64, top: 12, bottom: 22 };

export function ChanceChart({ points, label }: { points: readonly number[]; label: string }) {
  const [at, setAt] = useState<number | null>(null);
  if (points.length === 0) return null;
  const span = W - PAD.left - PAD.right;
  const x = (i: number) => PAD.left + (points.length === 1 ? span / 2 : (span * i) / (points.length - 1));
  const y = (pct: number) => PAD.top + ((100 - pct) / 100) * (H - PAD.top - PAD.bottom);
  const path = points.map((pct, i) => (i === 0 ? `M${x(0)},${y(pct)}` : `H${x(i)}V${y(pct)}`)).join("");
  const last = points.length - 1;
  const shown = at ?? last;
  const nearest = (clientX: number, box: DOMRect) => {
    const svgX = ((clientX - box.left) / box.width) * W;
    let best = 0;
    points.forEach((_, i) => {
      if (Math.abs(x(i) - svgX) < Math.abs(x(best) - svgX)) best = i;
    });
    return best;
  };
  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label}: ${points.map((p, i) => ACTIVITY.point(i + 1, p)).join("; ")}`}
        tabIndex={0}
        className="block h-auto w-full touch-none focus-visible:outline-2 focus-visible:outline-accent"
        onPointerMove={(e) => setAt(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
        onPointerLeave={() => setAt(null)}
        onBlur={() => setAt(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setAt(Math.max(0, shown - 1));
          if (e.key === "ArrowRight") setAt(Math.min(last, shown + 1));
        }}
      >
        {[0, 50, 100].map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
              {tick}%
            </text>
          </g>
        ))}
        <path
          d={path}
          fill="none"
          stroke="var(--yes-bar)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {at !== null ? (
          <line x1={x(at)} x2={x(at)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--muted)" strokeWidth={1} />
        ) : null}
        <circle cx={x(shown)} cy={y(points[shown])} r={4} fill="var(--yes-bar)" stroke="var(--panel)" strokeWidth={2} />
        <text x={x(last) + 8} y={y(points[last]) + 4} fontSize={12} fontWeight={600} fill="var(--text)">
          {ACTIVITY.endLabel(points[last])}
        </text>
        <text x={PAD.left} y={H - 6} fontSize={11} fill="var(--muted)">
          {ACTIVITY.firstEntry}
        </text>
        <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize={11} fill="var(--muted)">
          {ACTIVITY.lastEntry(points.length)}
        </text>
      </svg>
      <figcaption aria-live="polite" className="mt-1 text-xs text-muted">
        <b className="text-text">{ACTIVITY.endLabel(points[shown])}</b> · NO{" "}
        {Math.round((100 - points[shown]) * 10) / 10}%{ACTIVITY.readout(shown + 1)}
      </figcaption>
    </figure>
  );
}
