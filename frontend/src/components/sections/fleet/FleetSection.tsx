import { sectionIds } from "@/content/navigation";
import { fleetFeatures, fleetSection, fleetStats } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InViewAnimations } from "@/components/ui/InViewAnimations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatList } from "@/components/ui/StatList";
import { FleetMap } from "./FleetMap";

export function FleetSection() {
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

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
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
              <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-400">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
