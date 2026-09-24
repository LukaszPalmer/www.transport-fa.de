import type { HeroMediaConfig } from "@/types/content";

/**
 * Hero-Medien eines Ordners unter public/media/<folder>/ – die Dateinamen
 * erzeugt `npm run encode:hero -- <clip> --out <folder>` immer identisch.
 */
export function heroMedia(folder: string): HeroMediaConfig {
  const base = `/media/${folder}`;
  return {
    poster: `${base}/poster.jpg`,
    // Reihenfolge = Priorität: VP9/WebM (kleiner), H.264/MP4 als Fallback (Safari).
    desktop: [
      { src: `${base}/hero-1080.webm`, type: 'video/webm; codecs="vp9"' },
      { src: `${base}/hero-1080.mp4`, type: "video/mp4" },
    ],
    mobile: [
      { src: `${base}/hero-720.webm`, type: 'video/webm; codecs="vp9"' },
      { src: `${base}/hero-720.mp4`, type: "video/mp4" },
    ],
  };
}
