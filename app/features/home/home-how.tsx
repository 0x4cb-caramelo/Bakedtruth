/**
 * Purpose: the home page's "How it works" (the approved prototype's `.home-how`): the six steps told in three, with the
 *          link to every step, fee and refund, then the three principles, each with its icon. Baked may perch on the
 *          heading row.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import Link from "next/link";
import { ArrowRight, Eye, Vault, Wallet } from "lucide-react";

import { HOME, PRINCIPLES, STEPS } from "./copy";

const ICON = { eye: Eye, vault: Vault, wallet: Wallet };

export function HomeHow() {
  return (
    <>
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
    </>
  );
}
