"use client";

import { useEffect, useRef, useState } from "react";

import type { PricePoint } from "@/lib/history";

export type Range = "1D" | "1W" | "1M" | "ALL";
const RANGE_MS: Record<Exclude<Range, "ALL">, number> = { "1D": 86_400_000, "1W": 7 * 86_400_000, "1M": 30 * 86_400_000 };

const PAD = { top: 12, right: 44, bottom: 24, left: 4 };

function niceBounds(values: number[]) {
  const lo = Math.max(0, Math.floor((Math.min(...values) - 800) / 1000) * 1000);
  const hi = Math.min(10_000, Math.ceil((Math.max(...values) + 800) / 1000) * 1000);
  return hi - lo < 2000 ? [Math.max(0, hi - 2000), Math.min(10_000, lo + 2000)] : [lo, hi];
}

function timeLabel(t: number, spanMs: number) {
  const d = new Date(t);
  if (spanMs <= 2 * 86_400_000) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * YES chance over time as a step line (prices only change on trades), with dotted gridlines and a
 * percentage axis on the right. `end` is "now", so the last price runs to the right edge. Without a
 * `height` it fills its container's height.
 */
export function PriceChart({
  points,
  end,
  range = "ALL",
  height: fixedHeight,
  color = "var(--color-yes)",
}: {
  points: PricePoint[];
  end: number;
  range?: Range;
  height?: number;
  color?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry!.contentRect.width, height: entry!.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = size.width;
  const height = fixedHeight ?? Math.max(size.height, 200);
  const boxStyle = fixedHeight ? { height: fixedHeight } : undefined;
  const boxClass = fixedHeight ? "" : "h-full min-h-[200px]";

  if (points.length === 0) {
    return (
      <div ref={box} style={boxStyle} className={`grid place-items-center text-sm text-dim ${boxClass}`}>
        No trades yet
      </div>
    );
  }

  const first = points[0]!.time;
  const start = range === "ALL" ? first : Math.max(first, end - RANGE_MS[range]);
  // The price in force at `start`, then every change after it, then a flat run to `end`.
  const before = [...points].reverse().find((p) => p.time <= start);
  const inside = points.filter((p) => p.time > start && p.time <= end);
  const series: PricePoint[] = [{ time: start, bps: (before ?? points[0]!).bps }, ...inside];
  const last = series[series.length - 1]!;

  const [lo, hi] = niceBounds(series.map((p) => p.bps));
  const span = Math.max(end - start, 1);
  const w = Math.max(width - PAD.left - PAD.right, 1);
  const h = height - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + ((t - start) / span) * w;
  const y = (bps: number) => PAD.top + (1 - (bps - lo) / (hi - lo)) * h;

  let d = `M ${x(series[0]!.time)} ${y(series[0]!.bps)}`;
  for (const p of series.slice(1)) d += ` H ${x(p.time)} V ${y(p.bps)}`;
  d += ` H ${x(end)}`;
  const area = `${d} V ${y(lo)} H ${x(start)} Z`;

  const step = hi - lo > 5000 ? 2000 : 1000;
  const grid: number[] = [];
  for (let v = lo; v <= hi; v += step) grid.push(v);
  const ticks = [0, 1, 2, 3].map((i) => start + (span * i) / 3);

  const hoverPoint = hover === null ? null : [...series].reverse().find((p) => p.time <= hover) ?? series[0]!;

  return (
    <div ref={box} className={`relative w-full select-none ${boxClass}`} style={boxStyle}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const px = Math.min(Math.max(e.clientX - rect.left, PAD.left), PAD.left + w);
            setHover(start + ((px - PAD.left) / w) * span);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                x2={PAD.left + w}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--color-line)"
                strokeDasharray="1 5"
                strokeLinecap="round"
              />
              <text x={PAD.left + w + 8} y={y(v) + 4} className="fill-dim text-[11px] tabular-nums">
                {v / 100}%
              </text>
            </g>
          ))}
          {ticks.map((t, i) => (
            <text
              key={t}
              x={x(t)}
              y={height - 4}
              textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
              className="fill-dim text-[11px]"
            >
              {timeLabel(t, span)}
            </text>
          ))}
          <path d={area} fill="url(#area)" />
          <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={x(end)} cy={y(last.bps)} r={9} fill={color} opacity={0.18} />
          <circle cx={x(end)} cy={y(last.bps)} r={4.5} fill={color} stroke="var(--color-surface)" strokeWidth={2} />
          {hover !== null && hoverPoint && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + h} stroke="var(--color-muted)" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(hoverPoint.bps)} r={4} fill={color} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && hoverPoint && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-line bg-raised px-2 py-1 text-xs shadow-lg"
          style={{ left: Math.min(Math.max(x(hover) - 50, 0), Math.max(width - 110, 0)) }}
        >
          <span className="font-semibold text-yes tabular-nums">{hoverPoint.bps / 100}%</span>
          <span className="ml-2 text-dim">{new Date(hover).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
        </div>
      )}
    </div>
  );
}
