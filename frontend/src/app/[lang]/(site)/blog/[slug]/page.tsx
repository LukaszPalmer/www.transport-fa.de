import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  blogHref,
  blogPosts,
  getBlog,
  formatPostDate,
  getCategory,
  getPost,
  headingId,
  readingMinutes,
  sortedPosts,
} from "@/content/blog";
import { creditFor } from "@/content/image-credits";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { routes } from "@/content/navigation";
import { getService, serviceContactHref, serviceHref } from "@/content/services";
import { blogPostingJsonLd } from "@/lib/structured-data";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { PostCard } from "@/components/blog/PostCard";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { SmartLink } from "@/components/ui/SmartLink";

const messages = defineMessages({
  de: {
    faq: "Häufige Fragen",
    readTime: (minutes: number) => `${minutes} Min. Lesezeit`,
    breadcrumbs: "Brotkrumen",
    contents: "Inhalt",
    stock: "Symbolbild · Foto:",
    ctaService: (name: string) => `${name} in Düsseldorf & Umgebung?`,
    ctaGeneric: "Sie planen ein Vorhaben?",
    ctaText: "Kostenlose Beratung und ein verbindlicher Festpreis – in der Regel innerhalb von 24 Stunden.",
    toService: (name: string) => `Zur Leistung: ${name}`,
    quote: "Angebot anfordern",
    all: "Alle Beiträge",
    related: "Weiterlesen",
  },
  en: {
    faq: "Frequently asked questions",
    readTime: (minutes: number) => `${minutes} min read`,
    breadcrumbs: "Breadcrumbs",
    contents: "Contents",
    stock: "Stock photo · Photo:",
    ctaService: (name: string) => `${name} in Düsseldorf & the region?`,
    ctaGeneric: "Planning a project?",
    ctaText: "Free advice and a binding fixed price – usually within 24 hours.",
    toService: (name: string) => `Service: ${name}`,
    quote: "Request a quote",
    all: "All articles",
    related: "Read more",
  },
});

/** Alle Beiträge werden zur Build-Zeit statisch erzeugt; unbekannte Slugs → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const post = getPost((await params).slug, locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: blogHref(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [post.cover.src],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      section: getCategory(post.category, locale)?.name,
      tags: post.keywords,
    },
  };
}

/** Beitragsseite – Inhalte vollständig aus src/content/blog.ts. */
export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const locale = await getLocale();
  const t = messages[locale];
  const post = getPost((await params).slug, locale);
  if (!post) notFound();
  const coverCredit = creditFor(post.cover.src);

  const category = getCategory(post.category, locale);
  const service = category && getService(category.service, locale);
  const faqHeading = t.faq;
  const headings = [
    ...post.body.flatMap((block) => (block.type === "heading" ? [block.text] : [])),
    ...(post.faqs?.length ? [faqHeading] : []),
  ];
  const related = sortedPosts(getBlog(locale).blogPosts)
    .filter((other) => other.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);
  const initials = post.author.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, locale)} />
      <ReadingProgress targetId="beitrag" />

      <section aria-labelledby="post-title" className="relative isolate overflow-hidden bg-primary pt-36 pb-48 lg:pt-44 lg:pb-60">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_0%,rgb(56_189_248/0.2),transparent_65%)]" />
        <Container className="max-w-4xl text-center">
          <nav aria-label={t.breadcrumbs} className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <SmartLink href={routes.blog} className="hover:text-white">
              Blog
            </SmartLink>
            {category && (
              <>
                <span aria-hidden="true">/</span>
                <SmartLink href={`${routes.blog}?kategorie=${category.slug}`} className="inline-flex items-center gap-1.5 text-accent hover:text-white">
                  <Icon name={category.icon} className="size-4" />
                  {category.name}
                </SmartLink>
              </>
            )}
          </nav>
          <h1 id="post-title" className="mt-6 text-[clamp(2rem,6vw,3.5rem)] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance text-white">
            {post.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-300 sm:text-xl">{post.excerpt}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent font-bold text-primary">{initials}</span>
              <span className="text-left leading-tight">
                <span className="block font-semibold text-white">{post.author.name}</span>
                <span className="block text-xs text-slate-400">{post.author.role}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar-check" className="size-4 text-accent" />
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, locale)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" className="size-4 text-accent" />
              {t.readTime(readingMinutes(post))}
            </span>
          </div>
        </Container>
      </section>

      <div className="bg-white">
        <Container className="relative z-10 -mt-36 max-w-5xl lg:-mt-44">
          <figure>
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-primary shadow-elevated">
              <Image src={post.cover.src} alt={post.cover.alt} fill preload sizes="(min-width: 1024px) 64rem, 100vw" quality={75} className="object-cover" />
            </div>
            {coverCredit && (
              <figcaption className="mt-2 text-right text-xs text-slate-500">
                {t.stock}{" "}
                <a href={coverCredit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                  {coverCredit.photographer} / Pexels
                </a>
              </figcaption>
            )}
          </figure>
        </Container>

        <Container className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:py-20">
          {headings.length > 1 && (
            <aside className="lg:col-span-3">
              <nav aria-label={t.contents} className="rounded-2xl bg-surface p-5 ring-1 ring-slate-100 lg:sticky lg:top-28">
                <p className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">{t.contents}</p>
                <ol className="mt-4 space-y-2.5 text-sm">
                  {headings.map((heading) => (
                    <li key={heading}>
                      <a href={`#${headingId(heading)}`} className="block leading-snug text-slate-600 transition-colors hover:text-accent-ink">
                        {heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}

          <article id="beitrag" className={headings.length > 1 ? "lg:col-span-8 lg:col-start-5" : "mx-auto w-full max-w-3xl lg:col-span-12"}>
            <ArticleBody blocks={post.body} locale={locale} />

            {post.faqs && post.faqs.length > 0 && (
              <section aria-labelledby={headingId(faqHeading)} className="mt-14">
                <h2 id={headingId(faqHeading)} className="scroll-mt-28 text-2xl leading-tight font-bold text-primary sm:text-3xl">
                  {faqHeading}
                </h2>
                <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white px-6 shadow-card sm:px-8">
                  {post.faqs.map((faq) => (
                    <details key={faq.question} className="group py-2">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-display text-lg font-semibold text-primary [&::-webkit-details-marker]:hidden">
                        <h3>{faq.question}</h3>
                        <Icon name="arrow-right" className="size-5 shrink-0 text-accent-ink transition-transform duration-300 group-open:rotate-90" />
                      </summary>
                      <p className="pb-5 text-base leading-7 text-slate-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-16 flex flex-col gap-6 rounded-3xl bg-surface p-7 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="font-display text-lg font-bold text-primary">
                  {service ? t.ctaService(service.name) : t.ctaGeneric}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t.ctaText}
                  {service && (
                    <>
                      {" "}
                      <SmartLink href={serviceHref(service.slug)} className="font-semibold text-accent-ink underline underline-offset-4">
                        {t.toService(service.name)}
                      </SmartLink>
                    </>
                  )}
                </p>
              </div>
              <ButtonLink href={service ? serviceContactHref(service.slug) : routes.contactForm} variant="dark" withArrow>
                {t.quote}
              </ButtonLink>
            </div>

            <SmartLink href={routes.blog} className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-accent-ink hover:underline">
              <Icon name="arrow-right" className="size-4 rotate-180" />
              {t.all}
            </SmartLink>
          </article>
        </Container>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-surface py-20 lg:py-24">
          <Container>
            <h2 id="related-title" className="text-2xl font-bold text-primary sm:text-3xl">
              {t.related}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <PostCard key={other.slug} post={other} category={getCategory(other.category, locale)} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
