import { getHome } from "@/content/home";
import { getLocale } from "@/i18n/server";
import { PageHero } from "./PageHero";
import { ShipmentCard } from "./ShipmentCard";

/** Startseiten-Hero: Drohnenvideo + Live-Tracking-Karte. */
export async function HeroSection() {
  const { hero } = getHome(await getLocale());
  return <PageHero {...hero} aside={<ShipmentCard />} />;
}
