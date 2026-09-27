import { ImageResponse } from "next/og";
import { company } from "@/content/company";

export const alt = `${company.name} – Umzüge & Transporte. Präzise. Zuverlässig. Zum Festpreis.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social-Sharing-Bild, zur Build-Zeit statisch generiert. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "white",
          backgroundColor: "#0b132b",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.28), transparent 55%), linear-gradient(135deg, #0b132b 0%, #1c2541 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 36 36">
            <rect width="36" height="36" rx="9" fill="#38bdf8" />
            <path d="M8.5 26 15 10h5.5L14 26z M17.5 26 24 10h5.5L23 26z" fill="#0b132b" />
          </svg>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>{company.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
          <span>Umzüge & Transporte.</span>
          <span>Präzise. Zuverlässig.</span>
          <span style={{ color: "#38bdf8" }}>Zum Festpreis.</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#94a3b8" }}>
          <div style={{ width: 48, height: 4, borderRadius: 4, backgroundColor: "#38bdf8" }} />
          Umzüge · Entrümpelungen · Haushaltsauflösungen · Transporte
        </div>
      </div>
    ),
    size,
  );
}
