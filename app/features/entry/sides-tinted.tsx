/**
 * Purpose: the side words of a line written in green and red (Ronaldo, 2026-10-11): "YES" in the YES colour and "NO" in
 *          the NO colour wherever an estimate or a summary names a side ("If YES wins: …", "If NO wins: 0 SOL back."),
 *          the rest of the line untouched. Only the whole words are tinted, so "NOT" or "NONE" never are.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), in the UI overhaul
 */
export function SidesTinted({ text }: { text: string }) {
  return (
    <>
      {text.split(/\b(YES|NO)\b/).map((part, i) =>
        part === "YES" ? (
          <span key={i} className="text-yes-fg">
            YES
          </span>
        ) : part === "NO" ? (
          <span key={i} className="text-no-fg">
            NO
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
