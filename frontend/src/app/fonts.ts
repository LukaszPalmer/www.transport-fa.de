import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Schriften werden von next/font zur Build-Zeit selbst gehostet:
 * kein Request an Google (DSGVO), automatisches Preloading und
 * metrik-angepasste Fallbacks → kein Layout-Shift beim Font-Swap.
 * Gemeinsam genutzt von beiden Root-Layouts (Website/Portal und Admin).
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontClasses = `${inter.variable} ${jakarta.variable}`;
