/**
 * Purpose: the home page's "How it works" (the approved prototype's `.home-how`): the six steps told in three, with the
 *          link to every step, fee and refund, then the three principles, each with its icon. Baked may perch on the
 *          heading row. The yellow X in its top corner closes both for good in this browser (how-closed.ts): a
 *          returning baker gets the campaigns without the tour, and the full page stays in the top bar.
 * Version: 0.2.0 (the close button; 0.1.0, the UI overhaul)
 * Sprint:  10 (campaign list), in the UI overhaul
 */
"use client";

import Link from "next/link";
import { ArrowRight, Eye, Vault, Wallet, X } from "lucide-react";

import { HOME, PRINCIPLES, STEPS } from "./copy";
import { closeHow } from "./how-closed";

const ICON = { eye: Eye, vault: Vault, wallet: Wallet };

export function HomeHow() {
  return (
    <div className="home-how-wrap">
      <section className="home-how" aria-labelledby="home-how-title">
        <div
          className="home-how-head"
          data-perch="home-how"
          data-perch-x="0.5"
          data-perch-size="0.8"
          data-perch-pose="point"
          data-perch-say="Read, not voted."
        >
          <h2 id="home-how-title">{HOME.how}</h2>
          <Link href="/how-it-works">
            {HOME.howLink} <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <button
            className="icon-btn home-how-close"
            type="button"
            aria-label={HOME.howClose}
            title={HOME.howCloseHint}
            onClick={closeHow}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <ol className="home-steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <b className="num" aria-hidden="true">
                {i + 1}
              </b>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="home-why">
        <h2 id="home-why" className="sr-only">
          Why you can check it
        </h2>
        <ul className="home-principles">
          {PRINCIPLES.map(([icon, title, text]) => {
            const Icon = ICON[icon];
            return (
              <li key={title}>
                <span className="home-ic">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
