import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-Bildschirm-Icon für iOS (PNG, zur Build-Zeit erzeugt) – iOS rundet die Ecken selbst. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#38bdf8" }}>
        <svg width="140" height="140" viewBox="0 0 36 36">
          <path d="M8.5 26 15 10h5.5L14 26z M17.5 26 24 10h5.5L23 26z" fill="#0b132b" />
        </svg>
      </div>
    ),
    size,
  );
}
