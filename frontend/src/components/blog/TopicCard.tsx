import Image from "next/image";
import type { BlogCategory } from "@/content/blog";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

interface TopicCardProps {
  category: BlogCategory;
  /** Anzahl veröffentlichter Beiträge – 0 zeigt „In Vorbereitung". */
  count: number;
  href?: string;
  size?: "default" | "compact";
  className?: string;
}

/**
 * Themenkarte mit Bildmotiv: Kategorie, Kurzbeschreibung und Status. Bild zoomt beim
 * Hover leicht, ein Akzentstreifen läuft ein. Mit href ist die ganze Karte klickbar.
 */
export function TopicCard({ category, count, href, size = "default", className }: TopicCardProps) {
  const status = count > 0 ? `${count} ${count === 1 ? "Beitrag" : "Beiträge"}` : "In Vorbereitung";

  return (
    <article
      className={cn(
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl bg-primary p-6 shadow-card ring-1 ring-primary/5 transition-[translate,box-shadow] duration-500 ease-out-expo sm:p-7",
        size === "compact" ? "min-h-[19rem]" : "min-h-[24rem]",
        href && "hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      <Image
        src={category.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        quality={60}
        className="-z-20 object-cover opacity-80 transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-primary via-primary/80 to-primary/15" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(28rem_18rem_at_0%_100%,rgb(56_189_248/0.18),transparent_70%)]" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-accent to-accent-bright transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
      />

      <div className="absolute inset-x-6 top-6 flex items-start justify-between gap-3 sm:inset-x-7 sm:top-7">
        <span className="glass-dark flex size-12 items-center justify-center rounded-2xl text-accent">
          <Icon name={category.icon} className="size-5" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase",
            count > 0 ? "bg-accent text-primary" : "glass-dark text-slate-200",
          )}
        >
          {count === 0 && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent" />}
          {status}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white">
        {href ? (
          <SmartLink href={href} className="after:absolute after:inset-0">
            {category.name}
          </SmartLink>
        ) : (
          category.name
        )}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{category.description}</p>
      {href && (
        <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          {count > 0 ? "Beiträge lesen" : "Zum Blog"}
          <Icon name="arrow-up-right" className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </article>
  );
}
