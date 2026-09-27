import type { Metadata } from "next";
import Image from "next/image";
import { getBlog, sortedPosts, type BlogCategory } from "@/content/blog";
import { routes } from "@/content/navigation";
import { defineMessages, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { blogJsonLd } from "@/lib/structured-data";
import { BlogBrowser } from "@/components/blog/BlogBrowser";
import { TopicCard } from "@/components/blog/TopicCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";

const messages = defineMessages({
  de: {
    topics: "Themen",
    posts: "Beiträge",
    preparing: "In Vorbereitung",
    topicsTitle: "Darüber schreiben wir für Sie.",
    checklist: "Umzugs-Checkliste",
    checklistItems: ["Halteverbot beantragen", "Kartons & Material", "Adresse ummelden"],
    readMore: "Weiterlesen →",
  },
  en: {
    topics: "Topics",
    posts: "Articles",
    preparing: "In preparation",
    topicsTitle: "What we write about for you.",
    checklist: "Moving checklist",
    checklistItems: ["Apply for no-parking zone", "Boxes & materials", "Register new address"],
    readMore: "Read more →",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const { blogPage } = getBlog(await getLocale());
  return {
    title: blogPage.seo.title,
    description: blogPage.seo.description,
    alternates: { canonical: routes.blog },
    openGraph: { title: blogPage.seo.title, description: blogPage.seo.description, type: "website" },
  };
}

/**
 * Blog-Übersicht (statisch). Ohne veröffentlichte Beiträge zeigt sie die Themen, die
 * vorbereitet werden – mit Beiträgen den Aufmacher plus filterbares Raster.
 */
export default async function BlogPage() {
  const locale = await getLocale();
  const t = messages[locale];
  const { blogPage, blogCategories, blogPosts } = getBlog(locale);
  const posts = sortedPosts(blogPosts);
  const countFor = (slug: string) => posts.filter((post) => post.category === slug).length;

  return (
    <>
      <JsonLd data={blogJsonLd(posts, locale)} />

      <section aria-labelledby="blog-title" className="relative isolate overflow-hidden bg-primary pt-36 pb-40 lg:pt-44 lg:pb-52">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_75%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_100%_0%,rgb(56_189_248/0.2),transparent_65%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_20rem_at_0%_100%,rgb(0_229_255/0.08),transparent_70%)]" />

        <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark">{blogPage.eyebrow}</Eyebrow>
            <h1 id="blog-title" className="mt-5 text-[clamp(2.5rem,7vw,4rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white">
              <span className="block">{blogPage.titleLead}</span>
              <span className="text-gradient-accent block pb-1">{blogPage.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">{blogPage.description}</p>
            <ul className="mt-9 flex flex-wrap gap-2.5" aria-label={t.topics}>
              {blogCategories.map((category) => (
                <li key={category.slug} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-200">
                  <Icon name={category.icon} className="size-4 text-accent" />
                  {category.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden justify-center lg:col-span-5 lg:flex">
            <EditorialVisual categories={blogCategories} locale={locale} />
          </div>
        </Container>
      </section>

      <section aria-label={posts.length ? t.posts : t.topics} className="relative z-10 -mt-28 pb-24 lg:-mt-36 lg:pb-32">
        <Container>
          {posts.length > 0 ? (
            <div className="rounded-3xl bg-surface p-4 shadow-elevated ring-1 ring-primary/5 sm:p-6 lg:p-8">
              <BlogBrowser posts={posts} categories={blogCategories} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-10 rounded-3xl bg-white p-8 shadow-elevated ring-1 ring-primary/5 sm:p-12 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold tracking-wide text-accent-ink uppercase">
                    <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent-ink" />
                    {t.preparing}
                  </span>
                  <h2 className="mt-5 text-2xl leading-tight font-bold text-primary sm:text-3xl">{blogPage.comingSoon.title}</h2>
                  <p className="mt-4 leading-relaxed text-slate-600">{blogPage.comingSoon.text}</p>
                </div>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-7">
                  {blogPage.promises.map((promise) => (
                    <li key={promise.title} className="rounded-2xl bg-surface p-5 ring-1 ring-slate-100">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-accent">
                        <Icon name={promise.icon} className="size-5" />
                      </span>
                      <p className="mt-4 font-semibold text-primary">{promise.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{promise.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div id="themen" className="mt-20 scroll-mt-28">
                <Eyebrow>{t.topics}</Eyebrow>
                <h2 className="mt-4 text-3xl leading-tight font-bold text-primary sm:text-4xl">{t.topicsTitle}</h2>
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {blogCategories.map((category) => (
                    <TopicCard key={category.slug} category={category} count={countFor(category.slug)} locale={locale} />
                  ))}
                </div>
              </div>
            </>
          )}

          {blogPage.note && <p className="mt-6 text-center text-sm text-slate-500">{blogPage.note}</p>}
          <QuestionBand question={blogPage.question} />
        </Container>
      </section>
    </>
  );
}

/** Aufforderung, Fragen einzureichen – gute Themen für kommende Beiträge. */
function QuestionBand({ question }: { question: { title: string; text: string; cta: string } }) {
  const blogPage = { question };
  return (
    <div className="relative isolate mt-20 overflow-hidden rounded-3xl bg-primary px-8 py-12 sm:px-12 lg:mt-24 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:py-14">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_80%_50%,black,transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_18rem_at_100%_50%,rgb(56_189_248/0.22),transparent_70%)]" />
      <div className="flex gap-5">
        <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary sm:flex">
          <Icon name="message" className="size-6" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{blogPage.question.title}</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">{blogPage.question.text}</p>
        </div>
      </div>
      <ButtonLink href={`${routes.contact}?leistung=sonstiges#anfrage`} size="lg" withArrow className="mt-8 lg:mt-0">
        {blogPage.question.cta}
      </ButtonLink>
    </div>
  );
}

/** Dekorative Magazin-Collage: zwei Beitragskarten und eine Checkliste (rein visuell). */
function EditorialVisual({ categories, locale }: { categories: BlogCategory[]; locale: Locale }) {
  const t = messages[locale];
  const [front, back] = [categories[0]!, categories[3]!];
  return (
    <div aria-hidden="true" className="relative h-[27rem] w-full max-w-md">
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.22),transparent)]" />

      <MockCard category={back} readMore={t.readMore} className="absolute top-0 right-0 w-64 rotate-6 opacity-90" />
      <MockCard category={front} readMore={t.readMore} className="absolute top-16 left-4 w-72 -rotate-3 shadow-elevated" />

      <div className="glass-dark absolute -right-2 bottom-0 z-10 w-56 animate-float rounded-2xl p-4 shadow-elevated">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-white uppercase">
          <Icon name="check" className="size-4 text-accent" strokeWidth={2.5} />
          {t.checklist}
        </p>
        <ul className="mt-3 space-y-2">
          {t.checklistItems.map((item, index) => (
            <li key={item} className="flex items-center gap-2 text-xs text-slate-200">
              <span className={index < 2 ? "flex size-4 items-center justify-center rounded bg-accent text-primary" : "size-4 rounded border border-white/30"}>
                {index < 2 && <Icon name="check" className="size-3" strokeWidth={3} />}
              </span>
              <span className={index < 2 ? "text-slate-400 line-through" : undefined}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MockCard({ category, readMore, className }: { category: BlogCategory; readMore: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white ring-1 ring-white/10 ${className ?? ""}`}>
      <div className="relative h-32 bg-primary">
        <Image src={category.image} alt="" fill sizes="18rem" quality={50} className="object-cover" />
        <span className="glass-dark absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold text-white">
          <Icon name={category.icon} className="size-3 text-accent" />
          {category.name}
        </span>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="h-2 w-16 rounded-full bg-slate-200" />
        <div className="h-3 w-full rounded-full bg-slate-800/80" />
        <div className="h-3 w-4/5 rounded-full bg-slate-800/80" />
        <div className="h-2 w-full rounded-full bg-slate-200" />
        <div className="h-2 w-2/3 rounded-full bg-slate-200" />
        <p className="pt-1 text-[0.625rem] font-semibold text-accent-ink">{readMore}</p>
      </div>
    </div>
  );
}
