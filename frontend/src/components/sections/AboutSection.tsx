import { sectionIds } from "@/content/navigation";
import { getHome } from "@/content/home";
import { getLocale } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function AboutSection() {
  const locale = await getLocale();
  const { aboutSection, commitments, values } = getHome(locale);
  const [open, close] = locale === "en" ? ["“", "”"] : ["„", "“"];
  return (
    <section id={sectionIds.about} aria-labelledby="about-title" className="defer-render bg-white py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                id="about-title"
                eyebrow={aboutSection.eyebrow}
                title={aboutSection.title}
                description={aboutSection.intro}
              />
              <figure className="mt-10 border-l-2 border-accent pl-6">
                <blockquote className="font-display text-xl font-semibold leading-snug text-primary">
                  {open}
                  {aboutSection.mission}
                  {close}
                </blockquote>
                <figcaption className="mt-3 text-sm text-slate-500">{aboutSection.missionSource}</figcaption>
              </figure>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {values.map((value) => (
              <li
                key={value.title}
                data-reveal
                className="group rounded-2xl border border-slate-200/80 bg-surface p-8 transition-[background-color,border-color,box-shadow] duration-500 ease-out-expo hover:border-accent/40 hover:bg-white hover:shadow-card-hover"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-white text-accent-ink shadow-card ring-1 ring-slate-200 transition-colors duration-500 group-hover:bg-primary group-hover:text-accent group-hover:ring-primary">
                  <Icon name={value.icon} className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-primary">{value.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600 hyphens-auto">
                  {value.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Leistungsversprechen */}
        <div className="mt-20 rounded-2xl border border-slate-200/80 bg-surface p-6 sm:p-8 lg:p-10">
          <h3 className="text-lg font-bold text-primary">{aboutSection.commitmentsTitle}</h3>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {commitments.map((item) => (
              <li
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white px-3 py-5 text-center ring-1 ring-slate-200 transition-[box-shadow] duration-300 hover:shadow-card hover:ring-accent/50"
              >
                <Icon name={item.icon} className="size-6 text-accent-ink" />
                <span className="font-display text-sm font-bold text-primary">{item.value}</span>
                <span className="text-xs leading-snug text-balance text-slate-500 hyphens-auto">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
