import Image from "next/image";
import type { ReviewSource } from "@/types/content";
import { reviewPlatforms } from "@/content/reviews";

/**
 * Originallogo einer Bewertungsplattform. SVGs werden unverändert ausgeliefert
 * (unoptimized) – Markenrichtlinien verbieten Umfärben oder Verzerren.
 * Die Größe wird über die Höhe gesteuert, die Breite folgt dem Seitenverhältnis.
 */
export function PlatformLogo({ source, height }: { source: ReviewSource; height: number }) {
  const { name, logo } = reviewPlatforms[source];
  return (
    <Image
      src={logo.src}
      alt={name}
      width={Math.round((logo.width / logo.height) * height)}
      height={height}
      unoptimized
      className="block w-auto"
      style={{ height }}
    />
  );
}
