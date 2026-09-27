import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Gemeinsame Typen & Validierung aus dem Monorepo (TypeScript-Quellcode, kein Build-Schritt).
  transpilePackages: ["@fa/shared"],

  experimental: {
    serverActions: {
      // Bewerbungen mit Lebenslauf (max. 5 MB, siehe MAX_CV_MB) + Multipart-Overhead.
      bodySizeLimit: "6mb",
    },
  },

  images: {
    // AVIF zuerst (~30 % kleiner als WebP), WebP als Fallback.
    formats: ["image/avif", "image/webp"],
    // Next 16: erlaubte Qualitätsstufen müssen explizit freigegeben werden.
    qualities: [60, 75],
  },

  async redirects() {
    // „Mein Konto" heißt jetzt „Einstellungen" – alte Links (z. B. aus E-Mails) führen weiter, Query bleibt erhalten.
    return [
      { source: "/kundenportal/konto", destination: "/kundenportal/einstellungen", permanent: true },
      // „Transport & Logistik" heißt jetzt „Transport" – alte Links und Suchergebnisse führen weiter.
      { source: "/leistungen/transport-logistik", destination: "/leistungen/transport", permanent: true },
    ];
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Hero-Videos & Poster: lange cachen, bei Austausch via stale-while-revalidate aktualisieren.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
