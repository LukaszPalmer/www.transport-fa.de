import Image from "next/image";
import type { ReactNode } from "react";
import type { CtaLink, HeroMediaConfig } from "@/types/content";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { LiveDot } from "@/components/ui/LiveDot";
import { HeroMedia } from "./HeroMedia";

interface PageHeroProps {
  eyebrow: string;
  headline: string[];
  headlineAccent?: string;
  subheadline: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
  proofPoints?: string[];
  media: HeroMediaConfig;
  /** Inhalt rechts neben der Headline (ab lg), z. B. Tracking- oder Fakten-Karte. */
  aside?: ReactNode;
  /** "full" = volle Viewport-Höhe (Startseite), "large" = Unterseiten. */
  size?: "full" | "large";
  /** Brotkrumen über der Kategorie-Zeile (Unterseiten) – passend zum BreadcrumbList-JSON-LD. */
  breadcrumbs?: { items: Crumb[]; label: string };
}

/**
 * Overlay-Stack (~65 % Deckkraft im Textbereich) für maximale Lesbarkeit:
 * Grundton → Verlauf zur Textseite → Übergang nach unten → dezenter Akzent-Glow.
 */
function HeroOverlay() {
  return (
    <>
      <div className="absolute inset-0 bg-primary/50" />
      <div className="absolute inset-0 bg-linear-to-r from-primary/75 via-primary/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-primary via-primary/60 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_100%_0%,rgb(56_189_248/0.16),transparent_60%)]" />
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]" />
    </>
  );
}

/**
 * Hero mit Video-Hintergrund für alle Hauptseiten. Poster (next/image) wird
 * serverseitig gerendert, das Video lädt progressiv (siehe HeroMedia).
 * Unten ist Platz für die überlappende Kennzahlen-Leiste (StatsBar).
 */
export function PageHero({
  eyebrow,
  headline,
  headlineAccent,
  subheadline,
  primaryCta,
  secondaryCta,
  proofPoints,
  media,
  aside,
  size = "full",
  breadcrumbs,
}: PageHeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative isolate flex items-center overflow-hidden bg-primary pt-18 pb-36 md:pb-44",
        size === "full" ? "min-h-[max(40rem,100svh)]" : "min-h-[max(38rem,88svh)]",
      )}
    >
      <HeroMedia
        poster={
          <Image src={media.poster} alt="" fill preload sizes="100vw" quality={60} className="object-cover" />
        }
        overlay={<HeroOverlay />}
        desktopSources={media.desktop}
        mobileSources={media.mobile}
      />

      <Container className="relative py-12 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {breadcrumbs && <Breadcrumbs {...breadcrumbs} className="mb-5" />}
            <p className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-slate-200">
              <LiveDot className="text-accent" />
              {eyebrow}
            </p>

            <h1
              id="hero-title"
              className="mt-6 text-[clamp(2rem,9vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
            >
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {headlineAccent && <span className="text-gradient-accent block pb-1">{headlineAccent}</span>}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">{subheadline}</p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={primaryCta.href} size="lg" withArrow>
                {primaryCta.label}
              </ButtonLink>
              {secondaryCta && (
                <ButtonLink href={secondaryCta.href} variant="glass" size="lg">
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </div>

            {proofPoints && (
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                {proofPoints.map((point) => (
                  <li key={point} className="inline-flex items-center gap-2">
                    <Icon name="check" className="size-4 text-accent" strokeWidth={2.5} />
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {aside && <div className="hidden lg:col-span-4 lg:flex lg:justify-end">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}
