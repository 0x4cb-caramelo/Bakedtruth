// Purpose: the empty state: Baked sulking, one sentence and an optional way out (.empty). The mascot is the one served
// from public/mascot, the same as the live site. Sprint -1 (DESIGN-DIRECTION.md, "Estado vazio").
import Image from "next/image";
import type { ReactNode } from "react";

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <Image src="/mascot/sulking.png" alt="Baked, sulking" width={150} height={95} style={{ height: "auto" }} />
      <p>{children}</p>
      {action}
    </div>
  );
}
