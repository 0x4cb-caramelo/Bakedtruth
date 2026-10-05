"use client";

// Mounts the mascot once for the whole app. Each page decides where it may stand with
// data-perch attributes; see lib/mascot/perches.ts.

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { BRAND } from "@/lib/brand";
import { startMascot, type MascotHandle } from "@/lib/mascot/engine";

export function Mascot() {
  const pathname = usePathname();
  const handle = useRef<MascotHandle | null>(null);

  useEffect(() => {
    handle.current = startMascot({ base: "/mascot/", size: 80, stepped: true, quips: BRAND.quips });
    return () => {
      handle.current?.stop();
      handle.current = null;
    };
  }, []);

  // A route change swaps the perches under it; let it look around again.
  useEffect(() => {
    handle.current?.refresh();
  }, [pathname]);

  return null;
}
