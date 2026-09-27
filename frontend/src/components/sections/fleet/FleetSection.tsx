import Image from "next/image";
import { sectionIds } from "@/content/navigation";
import { getHome } from "@/content/home";
import { getLocale } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InViewAnimations } from "@/components/ui/InViewAnimations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatList } from "@/components/ui/StatList";
import { FleetMap } from "./FleetMap";

export async function FleetSection() {
  const { fleetFeatures, fleetSection, fleetStats } = getHome(await getLocale());
  return (
    <section
      id={sectionIds.fleet}
      aria-labelledby="fleet-title"
      className="defer-render relative isolate overflow-hidden bg-primary py-24 lg:py-32"
    >
      {/* Hintergrund: Raster + Akzent-Glow */}
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />
      {/* Glow als Radial-Gradient statt filter: blur() – gleiche Optik, ohne teures Rasterisieren */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(44rem_32rem_at_92%_0%,rgb(56_189_248/0.14),transparent_70%)]"
      />

      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-end lg:gap-16">
          <SectionHeading
            id="fleet-title"
            tone="dark"
            eyebrow={fleetSection.eyebrow}
            title={fleetSection.title}
          />
          <p className="text-lg leading-relaxed text-slate-300 lg:pb-2">{fleetSection.description}</p>
        </div>

        <figure data-reveal className="relative mt-16 aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:aspect-[21/9]">
          <Image
            src={fleetSection.image.src}
            alt={fleetSection.image.alt}
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            quality={75}
            className="object-cover object-[center_30%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
            <span className="font-display text-xl font-bold text-white sm:text-2xl">{fleetSection.image.caption}</span>
            <span className="shrink-0 text-xs text-slate-300">{fleetSection.image.note}</span>
          </figcaption>
        </figure>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-8">
            <InViewAnimations className="h-full">
              <FleetMap />
            </InViewAnimations>
          </div>

          {/* Kennzahlen: mobil 2×2, ab lg als Spalte in Kartenhöhe */}
          <StatList
            stats={fleetStats}
            className="grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-4"
            itemClassName="justify-center bg-secondary p-6 lg:px-8"
            valueClassName="text-3xl text-white lg:text-4xl"
            labelClassName="mt-1 text-sm text-slate-400"
          />
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {fleetFeatures.map((feature) => (
            <li
              key={feature.title}
              data-reveal
              className="group rounded-2xl border border-white/10 bg-secondary/60 p-6 transition-[background-color,border-color] duration-300 hover:border-accent/40 hover:bg-secondary lg:p-8"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-colors duration-300 group-hover:bg-accent group-hover:text-primary">
                <Icon name={feature.icon} className="size-5" />
              </div>
              <h3 className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold text-white">
                {feature.title}
                {feature.badge && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/30">
                    {feature.badge}
                  </span>
                )}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-400">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
