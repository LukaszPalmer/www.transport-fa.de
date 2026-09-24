import type { MetadataRoute } from "next";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { serviceHref, services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const url = (path: string) => `${company.siteUrl}${path === "/" ? "" : path}`;

  return [
    { url: url("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...services.map((service) => ({
      url: url(serviceHref(service.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: url(routes.contact), lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: url(routes.careers), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: url("/impressum"), lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: url("/datenschutz"), lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
