import Image from "next/image";
import { blogHref, formatPostDate, getCategory, readingMinutes, type BlogPost } from "@/content/blog";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/**
 * Beitragskarte. „featured" = großes Querformat für den Aufmacher der Übersicht.
 * Die ganze Karte ist klickbar (Stretched Link), bleibt aber ein einzelner Link.
 */
export function PostCard({ post, variant = "default", className }: { post: BlogPost; variant?: "default" | "featured"; className?: string }) {
  const category = getCategory(post.category);
  const featured = variant === "featured";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-primary/5 transition-[translate,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-card-hover",
        featured ? "flex-col lg:grid lg:grid-cols-2" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden bg-primary", featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]" : "aspect-[16/10]")}>
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          fill
          sizes={featured ? "(min-width: 1024px) 40rem, 100vw" : "(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"}
          quality={70}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        />
        {category && (
          <span className="glass-dark absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white">
            <Icon name={category.icon} className="size-3.5 text-accent" />
            {category.name}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col", featured ? "p-7 sm:p-10 lg:justify-center" : "p-6 sm:p-7")}>
        <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{readingMinutes(post)} Min. Lesezeit</span>
        </p>
        <h3 className={cn("mt-3 font-bold text-primary", featured ? "text-2xl leading-tight sm:text-3xl" : "text-lg leading-snug")}>
          <SmartLink href={blogHref(post.slug)} className="after:absolute after:inset-0">
            {post.title}
          </SmartLink>
        </h3>
        <p className={cn("mt-3 leading-relaxed text-slate-600", featured ? "text-base sm:text-lg" : "line-clamp-3 text-[0.9375rem]")}>{post.excerpt}</p>
        <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-accent-ink">
          Weiterlesen
          <Icon name="arrow-right" className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
