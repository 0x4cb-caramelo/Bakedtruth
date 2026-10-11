/**
 * Purpose: the home page's empty block (the approved prototype's `.empty`): Baked sulking, one sentence and at most one
 *          way out ("No campaigns here." [Clear filters]).
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
import type { ReactNode } from "react";

export function HomeEmpty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="home-empty">
      <div className="empty" data-perch="empty" data-perch-pose="sulking">
        {/* eslint-disable-next-line @next/next/no-img-element -- Baked's sprite, already sized */}
        <img src="/mascot/sulking.png" alt="Baked, sulking" width={150} height={95} />
        <p>{text}</p>
        {action}
      </div>
    </div>
  );
}
