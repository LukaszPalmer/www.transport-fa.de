import type { ReactNode } from "react";
import type { SocialPlatform } from "@/types/content";

/**
 * Marken-Icons (lucide-react liefert seit v1 keine Brand-Icons mehr).
 * Vereinfachte Glyphen im 24×24-Raster, Farbe über currentColor.
 */
const glyphs: Record<SocialPlatform, ReactNode> = {
  linkedin: (
    <path
      fill="currentColor"
      d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"
    />
  ),
  xing: (
    <path
      fill="currentColor"
      d="M5.2 6.8h3.3l2 3.5-2.8 4.9H4.4l2.8-4.9-2-3.5Zm11.2-3.3h3.4l-5.3 9.3 3.4 6.2h-3.4l-3.4-6.2 5.3-9.3Z"
    />
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </g>
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.6 21.5v-8.2h2.8l.4-3.2h-3.2V8.1c0-.9.3-1.6 1.6-1.6h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4v3.2h2.8v8.2h3.4Z"
    />
  ),
  youtube: (
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z"
    />
  ),
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      {glyphs[platform]}
    </svg>
  );
}
