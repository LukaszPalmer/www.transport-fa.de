import type { ServiceSlug } from "@/types/content";
import { getBlog, getCategory, sortedPosts } from "@/content/blog";
import { routes } from "@/content/navigation";
import { getLocale } from "@/i18n/server";
import { PostCard } from "@/components/blog/PostCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Ratgeber zur Leistung – schließt den Themen-Cluster: Beiträge verlinken auf ihre Leistungsseite,
 * die Leistungsseite verlinkt zurück auf ihre Beiträge. Ohne passende Beiträge entfällt die Sektion.
 */
export async function ServiceGuidesSection({ service, serviceName }: { service: ServiceSlug; serviceName: string }) {
  const locale = await getLocale();
  const { blogCategories, blogPosts } = getBlog(locale);
  const categories = new Set(blogCategories.filter((category) => category.service === service).map((category) => category.slug));
  const posts = sortedPosts(blogPosts)
    .filter((post) => categories.has(post.category))
    .slice(0, 3);
  if (posts.length === 0) return null;

  const en = locale === "en";
  return (
    <section aria-labelledby="guides-title" className="defer-render bg-surface py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="guides-title"
            eyebrow={en ? "Guides" : "Ratgeber"}
            title={en ? `Guides: ${serviceName}` : `Ratgeber: ${serviceName}`}
            description={
              en
                ? "Costs, checklists and practical tips from our day-to-day work – so you know what matters before you book."
                : "Kosten, Checklisten und Praxistipps aus unserem Alltag – damit Sie schon vor der Buchung wissen, worauf es ankommt."
            }
          />
          <ButtonLink href={routes.blog} variant="outline" size="lg" withArrow className="self-start lg:self-end">
            {en ? "All guides" : "Alle Ratgeber"}
          </ButtonLink>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} category={getCategory(post.category, locale)} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}
