/**
 * Purpose: the site's two fonts, served by the site itself: Barlow Condensed 700 for display and numbers, Inter 400, 500
 *          and 600 for text. next/font downloads them at build time and self-hosts them, so the browser never calls a
 *          font host. layout.tsx applies the className of each and the CSS variables they set.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet)
 */
import { Barlow_Condensed, Inter } from "next/font/google";

export const barlow = Barlow_Condensed({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});

export const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** The classes for <html>: both variables, in one string. */
export const fontClassName = `${barlow.variable} ${inter.variable}`;
