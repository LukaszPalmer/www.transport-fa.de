"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/content/navigation";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

const messages = defineMessages({
  de: { nav: "Kundenportal", overview: "Übersicht", tracking: "Tracking", invoices: "Rechnungen", documents: "Dokumente", settings: "Einstellungen" },
  en: { nav: "Customer portal", overview: "Overview", tracking: "Tracking", invoices: "Invoices", documents: "Documents", settings: "Settings" },
});

const items: Array<{ key: "overview" | "tracking" | "invoices" | "documents" | "settings"; href: string; icon: IconName }> = [
  { key: "overview", href: routes.portal, icon: "house" },
  { key: "tracking", href: routes.portalTracking, icon: "map-pin" },
  { key: "invoices", href: routes.portalInvoices, icon: "coins" },
  { key: "documents", href: routes.portalDocuments, icon: "file-text" },
  { key: "settings", href: routes.portalSettings, icon: "settings" },
];

/** Bereichs-Navigation des Kundenportals. */
export function PortalNav() {
  const pathname = usePathname();
  const t = useMessages(messages);

  return (
    <nav aria-label={t.nav} className="-mb-px flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = item.href === routes.portal ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
              active ? "border-accent text-white" : "border-transparent text-slate-400 hover:text-white",
            )}
          >
            <Icon name={item.icon} className="size-4" />
            {t[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
