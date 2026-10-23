import type { MetadataRoute } from "next";
import { blogHref, blogPosts } from "@/content/blog";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { serviceHref, services } from "@/content/services";
import { LOCALES } from "@/i18n/config";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import { postImage, serviceImage } from "@/lib/structured-data";

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates" | "images"> & { path: string; images?: string[] };

const latest = (dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));

/**
 * Sitemap mit beiden Sprachfassungen jeder Seite (inkl. hreflang-Verweisen) und den Seitenbildern
 * (Bilder-Sitemap). `lastModified` steht nur dort, wo das Datum bekannt ist (Leistungen: `updatedAt`,
 * Beiträge: Veröffentlichung/Aktualisierung) – ein bei jedem Deploy neues Datum für alle Seiten ignoriert Google.
 * Das Kundenportal (noindex) und /bewerten (noindex) fehlen bewusst.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const postDates = blogPosts.map((post) => post.updatedAt ?? post.publishedAt);
  const latestPost = postDates.length ? latest(postDates) : undefined;

  const pages: Entry[] = [
    { path: "/", lastModified: latest([...services.map((service) => service.updatedAt), ...postDates]), changeFrequency: "weekly", priority: 1 },
    ...services.map((service) => ({
      path: serviceHref(service.slug),
      lastModified: service.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      images: [serviceImage(service).url],
    })),
    { path: routes.contact, changeFrequency: "yearly", priority: 0.8 },
    { path: routes.blog, lastModified: latestPost, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((post) => ({
      path: blogHref(post.slug),
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [postImage(post).url],
    })),
    { path: routes.careers, changeFrequency: "monthly", priority: 0.6 },
    { path: "/impressum", changeFrequency: "yearly", priority: 0.2 },
    { path: "/datenschutz", changeFrequency: "yearly", priority: 0.2 },
  ];

  return pages.flatMap(({ path, images, ...entry }) =>
    LOCALES.map((locale) => ({
      ...entry,
      url: absoluteUrl(path, locale),
      alternates: { languages: languageAlternates(path) },
      ...(images && { images: images.map((src) => `${company.siteUrl}${src}`) }),
    })),
  );
}
