import type { MetadataRoute } from "next";
import { company } from "@/content/company";

/** Web-App-Manifest: Name, Farben und Icons, wenn die Website auf dem Startbildschirm abgelegt wird. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.legalName,
    short_name: company.name,
    description: company.descriptions.de,
    lang: "de",
    start_url: "/",
    display: "browser",
    background_color: "#0b132b",
    theme_color: "#0b132b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
