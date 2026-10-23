import { getLocale } from "@/i18n/server";
import { siteJsonLd } from "@/lib/structured-data";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/ui/JsonLd";

/** Layout aller öffentlichen Seiten: Header, Inhalt, Footer – und Unternehmen + Website als JSON-LD. */
export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  return (
    <>
      <JsonLd data={siteJsonLd(locale)} />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
