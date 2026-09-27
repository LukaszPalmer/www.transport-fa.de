import type { Review, ServiceSlug } from "@/types/content";
import { sectionIds } from "@/content/navigation";
import { reviewAuthenticityNote, reviewAuthenticityNoteEn, reviewPlatforms, reviews } from "@/content/reviews";
import { getService } from "@/content/services";
import { defineMessages, intlLocale, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button-styles";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { PlatformLogo } from "./PlatformLogo";
import { Stars } from "./Stars";

const messages = defineMessages({
  de: {
    eyebrow: "Bewertungen",
    title: "Das sagen unsere Kunden",
    titleFor: (service: string) => `Das sagen unsere Kunden zu ${service}`,
    of: (count: number, platform: string) => `aus ${count} Bewertungen auf ${platform}`,
    asOf: "Stand",
    original: "Original ansehen",
    anonymous: "Anonym",
    note: reviewAuthenticityNote,
    emptyTitle: "Ihre Erfahrung zählt.",
    emptyText:
      "Wir richten gerade unser Google-Unternehmensprofil ein. Sobald die ersten Kundenstimmen vorliegen, zeigen wir sie hier – unverändert und mit Quelle. Sie waren bereits Kunde? Wir freuen uns über Ihre ehrliche Bewertung.",
    write: "Bewertung schreiben",
    profile: "Profil ansehen",
    soon: "Folgt in Kürze",
    soonTooltip: "Bewertungen auf Google folgen in Kürze",
  },
  en: {
    eyebrow: "Reviews",
    title: "What our customers say",
    titleFor: (service: string) => `What our customers say about ${service}`,
    of: (count: number, platform: string) => `from ${count} reviews on ${platform}`,
    asOf: "As of",
    original: "View original",
    anonymous: "Anonymous",
    note: reviewAuthenticityNoteEn,
    emptyTitle: "Your experience counts.",
    emptyText:
      "We are setting up our Google business profile. As soon as the first reviews come in, we will show them here – unchanged and with their source. Already a customer? We would appreciate your honest review.",
    write: "Write a review",
    profile: "View profile",
    soon: "Coming soon",
    soonTooltip: "Google reviews coming soon",
  },
});

/** Die Gesamtnote kommt von der Plattform (alle Bewertungen) – nie aus der Auswahl auf dieser Seite. */
const ratedPlatform = Object.values(reviewPlatforms).find((platform) => platform.available && platform.rating);
const platformRating = ratedPlatform?.rating;

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

export async function ReviewsSection({ service }: { service?: ServiceSlug }) {
  const locale = await getLocale();
  const t = messages[locale];
  const { items, scoped } = selectReviews(service);
  const serviceName = service ? getService(service, locale)?.name : undefined;
  const title = scoped && serviceName ? t.titleFor(serviceName) : t.title;

  return (
    <section id={sectionIds.reviews} aria-labelledby="reviews-title" className="defer-render bg-white py-24 lg:py-32">
      <Container>
        {items.length === 0 ? (
          <EmptyState locale={locale} />
        ) : (
          <>
            <ReviewList items={items.slice(0, 6)} title={title} locale={locale} />
            <p className="mt-10 max-w-4xl text-xs leading-relaxed text-slate-500">{t.note}</p>
          </>
        )}
      </Container>
    </section>
  );
}

function ReviewList({ items, title, locale }: { items: Review[]; title: string; locale: Locale }) {
  const t = messages[locale];
  const dateFormat = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", year: "numeric" });
  const asOfFormat = new Intl.DateTimeFormat(intlLocale(locale), { day: "2-digit", month: "2-digit", year: "numeric" });
  const [open, close] = locale === "en" ? ["“", "”"] : ["„", "“"];

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="reviews-title" eyebrow={t.eyebrow} title={title} />
        {ratedPlatform && platformRating && (
          <SmartLink
            href={ratedPlatform.profileUrl}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-surface px-6 py-4 transition-shadow hover:shadow-card"
          >
            <span className="font-display text-4xl font-extrabold text-primary tabular-nums">
              {platformRating.value.toLocaleString(intlLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span>
              <Stars rating={Math.round(platformRating.value)} />
              <span className="mt-1 block text-sm text-slate-500">
                {t.of(platformRating.count, ratedPlatform.name)}
                <span className="block text-xs">
                  {t.asOf} {asOfFormat.format(new Date(platformRating.asOf))}
                </span>
              </span>
            </span>
          </SmartLink>
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
              <blockquote lang="de" className="mt-4 flex-1 text-[0.9375rem] leading-relaxed whitespace-pre-line text-slate-700">
                {open}
                {review.text}
                {close}
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-sm">
                <span>
                  <span className="font-semibold text-primary">{review.author === "Anonym" ? t.anonymous : review.author}</span>
                  <span className="block text-slate-500">
                    {dateFormat.format(new Date(review.date))}
                    {review.location && ` · ${review.location}`}
                  </span>
                </span>
                {review.url && (
                  <SmartLink href={review.url} className="font-medium text-accent-ink underline-offset-4 hover:underline">
                    {t.original}
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
function EmptyState({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <div className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-slate-200/80 bg-surface p-8 sm:p-12 lg:grid-cols-12 lg:p-16">
      <div className="lg:col-span-6">
        <SectionHeading id="reviews-title" eyebrow={t.eyebrow} title={t.emptyTitle} description={t.emptyText} />
      </div>
      <div className="lg:col-span-6">
        <ReviewPlatformLinks stacked />
      </div>
    </div>
  );
}

export async function ReviewPlatformLinks({ stacked, className }: { stacked?: boolean; className?: string }) {
  const locale = await getLocale();
  const t = messages[locale];
  return (
    <ul className={cn("grid grid-cols-1 gap-4", !stacked && "sm:grid-cols-2", className)}>
      {(Object.keys(reviewPlatforms) as Array<keyof typeof reviewPlatforms>).map((key) => {
        const platform = reviewPlatforms[key];
        const note = locale === "en" ? platform.noteEn : platform.note;
        if (!platform.available) {
          return (
            <li
              key={key}
              className={cn(
                "flex flex-col gap-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6",
                !stacked && "sm:flex-row sm:items-center sm:justify-between",
              )}
            >
              <div>
                <PlatformLogo source={key} height={key === "google" ? 28 : 24} />
                <p className="mt-2 text-sm text-slate-500">{note}</p>
              </div>
              <ComingSoon id={`review-${key}`} label={`${platform.name} – ${t.soon}`} tooltip={t.soonTooltip} className="rounded-full">
                <span className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold tracking-wide text-accent-ink uppercase">{t.soon}</span>
              </ComingSoon>
            </li>
          );
        }
        return (
          <li
            key={key}
            className={cn("flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card", !stacked && "sm:flex-row sm:items-center sm:justify-between")}
          >
            <div>
              <PlatformLogo source={key} height={key === "google" ? 28 : 24} />
              <p className="mt-2 text-sm text-slate-500">{note}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={platform.writeReviewUrl} className={buttonClasses({ variant: "dark", size: "sm" })}>
                {t.write}
              </SmartLink>
              <SmartLink href={platform.profileUrl} className={buttonClasses({ variant: "outline", size: "sm" })}>
                {t.profile}
              </SmartLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
