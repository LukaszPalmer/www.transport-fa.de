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
import { organizationJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Startseite – reine Komposition. Alle Sektionen sind Server Components;
 * Client-JS entsteht nur für Hero-Video, Dropdown und Mobilmenü.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const { trustStats } = getHome(locale);
  return (
    <>
      <JsonLd data={organizationJsonLd(locale)} />
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
