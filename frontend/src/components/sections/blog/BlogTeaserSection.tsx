import { getBlog, getCategory, sortedPosts } from "@/content/blog";
import { getLocale } from "@/i18n/server";
import { routes, sectionIds } from "@/content/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { TopicCard } from "@/components/blog/TopicCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Startseite: „Lesen Sie, worauf es ankommt" – die drei neuesten Beiträge bzw., solange
 * noch keine erschienen sind, die Themen des Blogs. Alles führt zur Blog-Seite.
 */
export async function BlogTeaserSection() {
  const locale = await getLocale();
  const { blogPage, blogCategories, blogPosts } = getBlog(locale);
  const posts = sortedPosts(blogPosts).slice(0, 3);
  const { teaser } = blogPage;

  return (
    <section id={sectionIds.blog} aria-labelledby="blog-teaser-title" className="defer-render bg-white py-24 lg:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="blog-teaser-title" eyebrow={teaser.eyebrow} title={teaser.title} description={teaser.description} />
          <ButtonLink href={routes.blog} variant="outline" size="lg" withArrow className="self-start lg:self-end">
            {locale === "en" ? "To the blog" : "Zum Blog"}
          </ButtonLink>
        </div>

        {posts.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} category={getCategory(post.category, locale)} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogCategories.map((category) => (
              <TopicCard key={category.slug} category={category} count={0} href={`${routes.blog}#themen`} size="compact" locale={locale} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
