/**
 * Purpose: one browser record of a retry guard, read for the guards' clean-up (an entry's and an opening's): a record
 *          that does not parse, or is not an object, guards nothing and reads as none, so the clean-up deletes it
 *          instead of stopping on it and keeping every other record (the Sprint 19 coordinator review).
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
export function storedRecord<T>(text: string | null): Partial<T> | null {
  try {
    const value: unknown = JSON.parse(text ?? "null");
    return typeof value === "object" && value !== null ? (value as Partial<T>) : null;
  } catch {
    return null;
  }
}
