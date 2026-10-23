import { ImageResponse } from "next/og";

/**
 * Logo als PNG (512 × 512) für das Organization-JSON-LD und das Web-App-Manifest – Google empfiehlt
 * für Unternehmenslogos eine Rastergrafik ab 112 px. Zur Build-Zeit erzeugt, Quelle wie app/icon.svg.
 */
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <svg width="512" height="512" viewBox="0 0 36 36">
          <rect width="36" height="36" rx="9" fill="#38bdf8" />
          <path d="M8.5 26 15 10h5.5L14 26z M17.5 26 24 10h5.5L23 26z" fill="#0b132b" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
