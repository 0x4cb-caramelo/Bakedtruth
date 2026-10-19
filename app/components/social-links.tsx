/**
 * Purpose: Brot's X and Discord (the founder, 2026-10-18): the two addresses, which the footer links by name, and the
 *          two small logo links under the home page's subtitle. Plain links with inline logos, never an X or Discord
 *          script.
 * Version: 0.1.0
 * Sprint:  23 (the founder's request)
 */
export const X_URL = "https://x.com/brotmarkets";
export const DISCORD_URL = "https://discord.gg/Z5wYEUBR9a";

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.9 2h6.4l4.4 5.9L18.9 2Zm-1.1 18.1h1.7L8.3 3.8H6.5l11.3 16.3Z" />
    </svg>
  );
}

function DiscordLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.3 4.4A19.7 19.7 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.8 19.8 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14.1 14.1 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.2-.9-9.7-3.6-13.7ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}

/** The two logos as links, quiet until hovered. */
export function SocialLinks() {
  return (
    <div className="social">
      <a href={X_URL} target="_blank" rel="noreferrer" aria-label="Brot Markets on X" title="X">
        <XLogo />
      </a>
      <a href={DISCORD_URL} target="_blank" rel="noreferrer" aria-label="Brot Markets on Discord" title="Discord">
        <DiscordLogo />
      </a>
    </div>
  );
}
