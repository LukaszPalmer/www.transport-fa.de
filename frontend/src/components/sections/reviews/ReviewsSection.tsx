import type { Review, ServiceSlug } from "@/types/content";
import { sectionIds } from "@/content/navigation";
import { MIN_REVIEWS_FOR_AVERAGE, reviewAuthenticityNote, reviewPlatforms, reviews } from "@/content/reviews";
import { getService } from "@/content/services";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { PlatformLogo } from "./PlatformLogo";
import { Stars } from "./Stars";

const dateFormat = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });

/**
 * Welche Bewertungen erscheinen? Auf Leistungsseiten zuerst die passenden;
 * gibt es dafür (noch) keine, allgemeine – nie Bewertungen anderer Leistungen
 * ohne Kennzeichnung. Neueste zuerst.
 */
function selectReviews(service?: ServiceSlug): { items: Review[]; scoped: boolean } {
  const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
  if (!service) return { items: sorted, scoped: false };
  const matching = sorted.filter((review) => review.service === service);
  return matching.length > 0 ? { items: matching, scoped: true } : { items: sorted, scoped: false };
}

export function ReviewsSection({ service }: { service?: ServiceSlug }) {
  const { items, scoped } = selectReviews(service);
  const serviceName = service ? getService(service)?.name : undefined;
  const title = scoped && serviceName ? `Das sagen unsere Kunden zu ${serviceName}` : "Das sagen unsere Kunden";

  return (
    <section
      id={sectionIds.reviews}
      aria-labelledby="reviews-title"
      className="defer-render bg-white py-24 lg:py-32"
    >
      <Container>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ReviewList items={items.slice(0, 6)} title={title} />
            <p className="mt-10 max-w-4xl text-xs leading-relaxed text-slate-500">{reviewAuthenticityNote}</p>
          </>
        )}
      </Container>
    </section>
  );
}

function ReviewList({ items, title }: { items: Review[]; title: string }) {
  const showAverage = reviews.length >= MIN_REVIEWS_FOR_AVERAGE;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / Math.max(reviews.length, 1);

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="reviews-title" eyebrow="Bewertungen" title={title} />
        {showAverage && (
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-surface px-6 py-4">
            <span className="font-display text-4xl font-extrabold text-primary tabular-nums">
              {average.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span>
              <Stars rating={Math.round(average)} />
              <span className="mt-1 block text-sm text-slate-500">aus {reviews.length} Bewertungen</span>
            </span>
          </div>
        )}
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((review) => (
          <li key={review.id} data-reveal>
            <figure className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-surface p-6">
              <div className="flex items-center justify-between gap-4">
                <Stars rating={review.rating} />
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                  <PlatformLogo source={review.source} height={review.source === "google" ? 16 : 14} />
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-slate-700">
                „{review.text}“
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm">
                <span>
                  <span className="font-semibold text-primary">{review.author}</span>
                  <span className="block text-slate-500">{dateFormat.format(new Date(review.date))}</span>
                </span>
                {review.url && (
                  <SmartLink href={review.url} className="font-medium text-accent-ink underline-offset-4 hover:underline">
                    Original ansehen
                  </SmartLink>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <ReviewPlatformLinks className="mt-10" />
    </>
  );
}

/** Solange noch keine Bewertungen vorliegen: ehrlicher, einladender Zustand. */
function EmptyState() {
  return (
    <div className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-slate-200/80 bg-surface p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
      <div className="lg:col-span-6">
        <SectionHeading
          id="reviews-title"
          eyebrow="Bewertungen"
          title="Ihre Erfahrung zählt."
          description="Wir haben unsere Profile bei Google und MyHammer neu eingerichtet. Sobald die ersten Kundenstimmen vorliegen, zeigen wir sie hier – unverändert und mit Quelle. Sie waren bereits Kunde? Wir freuen uns über Ihre ehrliche Bewertung."
        />
      </div>
      <div className="lg:col-span-6">
        <ReviewPlatformLinks stacked />
      </div>
    </div>
  );
}

export function ReviewPlatformLinks({ stacked, className }: { stacked?: boolean; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-4", !stacked && "sm:grid-cols-2", className)}>
      {(Object.keys(reviewPlatforms) as Array<keyof typeof reviewPlatforms>).map((key) => {
        const platform = reviewPlatforms[key];
        return (
          <li
            key={key}
            className={cn(
              "flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card",
              !stacked && "sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            <div>
              {/* Optisch angeglichene Höhen: Googles Schriftzug füllt seine Box, MyHammer hat Bildmarke + Text */}
              <PlatformLogo source={key} height={key === "google" ? 28 : 24} />
              <p className="mt-2 text-sm text-slate-500">{platform.note}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={platform.writeReviewUrl} className={buttonClasses({ variant: "dark", size: "sm" })}>
                Bewertung schreiben
              </SmartLink>
              <SmartLink href={platform.profileUrl} className={buttonClasses({ variant: "outline", size: "sm" })}>
                Profil ansehen
              </SmartLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
