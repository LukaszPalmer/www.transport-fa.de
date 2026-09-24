import Image from "next/image";
import { appMap } from "@/content/app-map.generated";
import { trackingApp, trackingDemo } from "@/content/app";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InViewAnimations } from "@/components/ui/InViewAnimations";
import { LogoMark } from "@/components/ui/Logo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmartLink } from "@/components/ui/SmartLink";
import { AppScreen } from "./AppScreen";
import { RouteLayer } from "./RouteLayer";
import { TrackingPhone } from "./TrackingPhone";

const BADGE_HEIGHT = 48;

/** Originale Store-Badges (unverändert, gleiche Höhe laut Apple-/Google-Richtlinien). */
function StoreBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {Object.values(trackingApp.stores).map((store) => (
        <SmartLink
          key={store.href}
          href={store.href}
          aria-label={store.label}
          className="rounded-[10px] transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <Image
            src={store.badge.src}
            alt=""
            width={Math.round((store.badge.width / store.badge.height) * BADGE_HEIGHT)}
            height={BADGE_HEIGHT}
            unoptimized
            className="block w-auto"
            style={{ height: BADGE_HEIGHT }}
          />
        </SmartLink>
      ))}
    </div>
  );
}

/**
 * „FA Tracking App“ – App-Vorstellung mit Smartphone-Mockup und Live-Route.
 * Karte: echte Geodaten (statisch), optional echtes Google Maps per Zustimmung.
 */
export function TrackingAppSection() {
  return (
    <section
      id="tracking-app"
      aria-labelledby="tracking-app-title"
      className="defer-render relative isolate overflow-hidden bg-surface py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_32rem_at_78%_50%,rgb(56_189_248/0.16),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(11_19_43/0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_78%_50%,black,transparent_65%)]"
      />

      <Container className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 xl:col-span-5">
          <SectionHeading
            id="tracking-app-title"
            eyebrow={trackingApp.eyebrow}
            title={trackingApp.title}
            description={trackingApp.description}
          />

          <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
            {trackingApp.features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-accent shadow-card">
                  <Icon name={feature.icon} className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold text-primary">{feature.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">{feature.description}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <StoreBadges />
            <p className="mt-4 text-sm text-slate-500">{trackingApp.note}</p>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-6 xl:col-span-7">
          <InViewAnimations className="relative w-[280px] sm:w-[320px] xl:w-[340px]">
            {/* Lichtschein hinter dem Gerät */}
            <div
              aria-hidden="true"
              className="absolute -inset-16 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.28),transparent)]"
            />

            <TrackingPhone
              mapImage={appMap.image}
              mapAttribution={appMap.attribution}
              routeLayer={<RouteLayer />}
              routeLatLng={appMap.route.latLng}
              progress={trackingDemo.progress}
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || undefined}
            >
              <AppScreen />
            </TrackingPhone>

            {/* Schwebende Karten: Push-Benachrichtigung & Zustellung */}
            <div
              aria-hidden="true"
              className="absolute top-36 -left-32 z-10 hidden w-64 animate-float items-start gap-3 rounded-2xl bg-white/95 p-3.5 shadow-elevated ring-1 ring-primary/5 sm:flex xl:-left-48"
            >
              <LogoMark className="size-9 shrink-0 rounded-[10px]" />
              <span className="min-w-0 leading-snug">
                <span className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-primary">{trackingDemo.notification.title}</span>
                  <span className="text-slate-400">{trackingDemo.notification.time}</span>
                </span>
                <span className="mt-0.5 block text-[13px] text-slate-600">{trackingDemo.notification.text}</span>
              </span>
            </div>

            <div
              aria-hidden="true"
              className="absolute -right-24 bottom-6 z-10 hidden w-60 animate-float items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-elevated ring-1 ring-primary/5 [animation-delay:-3s] sm:flex xl:-right-40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60">
                <Icon name="check" className="size-4" strokeWidth={2.5} />
              </span>
              <span className="leading-snug">
                <span className="block text-[13px] font-bold text-primary">{trackingDemo.delivered.title}</span>
                <span className="block text-xs text-slate-500">{trackingDemo.delivered.text}</span>
              </span>
            </div>
          </InViewAnimations>
        </div>
      </Container>
    </section>
  );
}
