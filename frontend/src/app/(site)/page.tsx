import type { Metadata } from "next";
import { trustStats } from "@/content/home";
import { AboutSection } from "@/components/sections/AboutSection";
import { CareersTeaser } from "@/components/sections/CareersTeaser";
import { ContactCta } from "@/components/sections/ContactCta";
import { FleetSection } from "@/components/sections/fleet/FleetSection";
import { HeroSection } from "@/components/sections/hero/HeroSection";
import { ReviewsSection } from "@/components/sections/reviews/ReviewsSection";
import { ServicesSection } from "@/components/sections/services/ServicesSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { TrackingAppSection } from "@/components/sections/app/TrackingAppSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Startseite – reine Komposition. Alle Sektionen sind Server Components;
 * Client-JS entsteht nur für Hero-Video, Dropdown und Mobilmenü.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <HeroSection />
      <StatsBar stats={trustStats} label="Unternehmen in Zahlen" />
      <ServicesSection />
      <FleetSection />
      <TrackingAppSection />
      <AboutSection />
      <ReviewsSection />
      <CareersTeaser />
      <ContactCta />
    </>
  );
}
