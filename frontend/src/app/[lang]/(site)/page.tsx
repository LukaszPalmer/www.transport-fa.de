import type { Metadata } from "next";
import { getHome } from "@/content/home";
import { getLocale } from "@/i18n/server";
import { AboutSection } from "@/components/sections/AboutSection";
import { CareersTeaser } from "@/components/sections/CareersTeaser";
import { ContactCta } from "@/components/sections/ContactCta";
import { FleetSection } from "@/components/sections/fleet/FleetSection";
import { HeroSection } from "@/components/sections/hero/HeroSection";
import { ReviewsSection } from "@/components/sections/reviews/ReviewsSection";
import { ServicesSection } from "@/components/sections/services/ServicesSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { TrackingAppSection } from "@/components/sections/app/TrackingAppSection";
import { BlogTeaserSection } from "@/components/sections/blog/BlogTeaserSection";
import { LiveChatSection } from "@/components/sections/chat/LiveChatSection";
import { ReferralSection } from "@/components/sections/referral/ReferralSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { homeSeo } = getHome(locale);
  return pageMetadata({ path: "/", locale, title: { absolute: homeSeo.title }, description: homeSeo.description });
}

/**
 * Startseite – reine Komposition. Alle Sektionen sind Server Components;
 * Client-JS entsteht nur für Hero-Video, Dropdown und Mobilmenü.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const { trustStats, homeSeo } = getHome(locale);
  return (
    <>
      <JsonLd data={webPageJsonLd({ path: "/", locale, name: homeSeo.title, description: homeSeo.description })} />
      <HeroSection />
      <StatsBar stats={trustStats} label={locale === "en" ? "Company in figures" : "Unternehmen in Zahlen"} />
      <ServicesSection />
      <FleetSection />
      <TrackingAppSection />
      <LiveChatSection />
      <AboutSection />
      <ReviewsSection />
      <ReferralSection />
      <BlogTeaserSection />
      <CareersTeaser />
      <ContactCta />
    </>
  );
}
