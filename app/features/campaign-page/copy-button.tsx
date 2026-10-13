/**
 * Purpose: "Copy" for an address or a command on the campaign page, with what happened said in a polite live region
 *          (copied, or the browser blocked it). The re-check panel's labelled button; `compact`, an icon-only one for
 *          the proof's address rows, named for screen readers by its label. Moved out of recheck-panel.tsx.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry); the sixth kind's site (the proof's addresses)
 */
"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RECHECK } from "./copy";

export function CopyButton({ text, label, compact = false }: { text: string; label: string; compact?: boolean }) {
  const [said, setSaid] = useState<string | null>(null);
  const copy = () =>
    navigator.clipboard
      .writeText(text)
      .then(() => setSaid(RECHECK.copied))
      .catch(() => setSaid(RECHECK.copyBlocked));
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant={compact ? "icon" : "secondary"}
        small={!compact}
        className={compact ? "size-7" : undefined}
        onClick={copy}
        aria-label={`${RECHECK.copy} ${label}`}
        title={compact ? `${RECHECK.copy} ${text}` : undefined}
      >
        <Copy className="size-3.5" aria-hidden="true" />
        {compact ? null : RECHECK.copy}
      </Button>
      <span aria-live="polite" className="text-xs text-muted">
        {said}
      </span>
    </span>
  );
}
