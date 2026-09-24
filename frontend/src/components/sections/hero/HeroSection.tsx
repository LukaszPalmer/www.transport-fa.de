import { hero } from "@/content/home";
import { PageHero } from "./PageHero";
import { ShipmentCard } from "./ShipmentCard";

/** Startseiten-Hero: Drohnenvideo + Live-Tracking-Karte. */
export function HeroSection() {
  return <PageHero {...hero} aside={<ShipmentCard />} />;
}
