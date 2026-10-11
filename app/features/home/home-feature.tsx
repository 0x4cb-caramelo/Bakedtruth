/**
 * Purpose: the home page's "Open now" carousel (the approved prototype's `.home-feature`, home-mosaic.js): the
 *          top-ranked listed campaigns that take entries, up to five, as a scroll-snap track with arrows, dots, the
 *          position and a Pause button. It moves by itself only for a mouse without reduced motion, stops on hover and
 *          focus, and never announces an automatic change; a swipe sets the current slide. Phones get a swipe row of
 *          the standard cards (cards.css).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Plus, TrendingUp } from "lucide-react";

import type { Card } from "@/features/campaigns/model";
import type { Readings } from "@/features/campaigns/use-readings";
import { HOME } from "./copy";
import { HomeEmpty } from "./home-empty";
import { HomeSlide } from "./home-slide";

const INTERVAL_MS = 5_500;
const MOUSE = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";

/** It moves by itself only for a mouse without reduced motion: both media queries, followed as they change. */
const subscribeMedia = (notify: () => void) => {
  const queries = [matchMedia(MOUSE), matchMedia(REDUCE)];
  queries.forEach((q) => q.addEventListener("change", notify));
  return () => queries.forEach((q) => q.removeEventListener("change", notify));
};
const mayMove = () => matchMedia(MOUSE).matches && !matchMedia(REDUCE).matches;
const serverMove = () => false;

type Props = {
  cards: readonly Card[];
  loading: boolean;
  now: bigint;
  readings: Readings;
  saved: ReadonlySet<string>;
  onToggle: (address: string) => void;
};

export function HomeFeature({ cards, loading, now, readings, saved, onToggle }: Props) {
  const n = cards.length;
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const [busy, setBusy] = useState(false); // hovered or focused
  const auto = useSyncExternalStore(subscribeMedia, mayMove, serverMove) && n > 1;
  const steering = useRef(0);
  const current = Math.min(at, Math.max(0, n - 1));

  const go = useCallback(
    (k: number) => {
      const el = track.current;
      if (!el || n === 0) return;
      const next = (k + n) % n;
      const slide = el.children[next] as HTMLElement | undefined;
      steering.current = performance.now() + 900; // the scroll this causes is ours, not a swipe
      el.scrollTo({ left: (slide?.offsetLeft ?? 0) - (el.children[0] as HTMLElement).offsetLeft, behavior: "smooth" });
      setAt(next);
    },
    [n],
  );

  useEffect(() => {
    if (!auto || held || busy) return;
    const timer = setInterval(() => go(current + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [auto, held, busy, current, go]);

  const onScroll = () => {
    const el = track.current;
    if (!el || performance.now() < steering.current) return;
    const first = (el.children[0] as HTMLElement | undefined)?.offsetLeft ?? 0;
    let best = 0;
    [...el.children].forEach((child, k) => {
      const d = Math.abs((child as HTMLElement).offsetLeft - first - el.scrollLeft);
      const b = Math.abs((el.children[best] as HTMLElement).offsetLeft - first - el.scrollLeft);
      if (d < b) best = k;
    });
    if (best !== current) setAt(best);
  };

  return (
    <section
      className="home-feature"
      aria-roledescription="carousel"
      aria-labelledby="home-open-now"
      aria-busy={loading || undefined}
      data-perch="home-feature"
      data-perch-x="0.9"
      data-perch-size="1"
      data-perch-say="Open now."
      onPointerEnter={() => setBusy(true)}
      onPointerLeave={() => setBusy(false)}
      onFocus={() => setBusy(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget as Node) && setBusy(false)}
    >
      <div className="home-feature-head">
        <h2 id="home-open-now">
          <TrendingUp className="size-[15px]" aria-hidden="true" />
          {HOME.openNow}
        </h2>
        {n > 1 ? (
          <>
            <span className="home-pos" aria-hidden="true">
              {current + 1} of {n}
            </span>
            <div className="home-pager">
              {auto ? (
                <button
                  type="button"
                  className="icon-btn home-play"
                  aria-label={held ? "Play the slides" : "Pause the slides"}
                  onClick={() => setHeld((was) => !was)}
                >
                  {held ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
                </button>
              ) : null}
              <button type="button" className="icon-btn" aria-label="Previous campaign" onClick={() => go(current - 1)}>
                <ArrowLeft className="size-[15px]" aria-hidden="true" />
              </button>
              <span className="home-dots">
                {cards.map((c, k) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Campaign ${k + 1} of ${n}: ${c.asset ?? c.title}`}
                    aria-current={k === current}
                    onClick={() => go(k)}
                  />
                ))}
              </span>
              <button type="button" className="icon-btn" aria-label="Next campaign" onClick={() => go(current + 1)}>
                <ArrowRight className="size-[15px]" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : null}
      </div>
      {loading ? (
        <div className="home-skel skel flex-1" aria-hidden="true" />
      ) : n ? (
        <div className="home-track" ref={track} onScroll={onScroll}>
          {cards.map((card, k) => (
            <HomeSlide
              key={card.id}
              card={card}
              index={k}
              total={n}
              now={now}
              reading={readings.get(card.id)}
              saved={saved.has(card.address)}
              onToggle={() => onToggle(card.address)}
            />
          ))}
        </div>
      ) : (
        <HomeEmpty
          text={HOME.noOpen}
          action={
            <Link className="btn" href="/abrir">
              <Plus className="size-[15px]" aria-hidden="true" />
              {HOME.open}
            </Link>
          }
        />
      )}
    </section>
  );
}
