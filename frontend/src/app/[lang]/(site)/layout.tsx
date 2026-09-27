import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Layout aller öffentlichen Seiten: Header, Inhalt, Footer. */
export default function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
