import type { HeroMediaConfig } from "@/types/content";

/**
 * Hero-Medien eines Ordners unter public/media/<folder>/ – die Dateinamen
 * erzeugt `npm run encode:hero -- <clip> --out <folder>` immer identisch.
 * `posterSize` = Pixelmaße von poster.jpg (Open Graph, JSON-LD), Standard 1920 × 1080.
 */
export function heroMedia(folder: string, posterSize = { width: 1920, height: 1080 }): HeroMediaConfig {
  const base = `/media/${folder}`;
  return {
    poster: `${base}/poster.jpg`,
    posterSize,
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
