/**
 * Purpose: joins class names, dropping the falsy ones. The only helper the primitives share.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
export const cx = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(" ");
