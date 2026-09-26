"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Übersicht", href: routes.portal, icon: "house" },
  { label: "Tracking", href: routes.portalTracking, icon: "map-pin" },
  { label: "Rechnungen", href: routes.portalInvoices, icon: "coins" },
  { label: "Dokumente", href: routes.portalDocuments, icon: "file-text" },
  { label: "Einstellungen", href: routes.portalSettings, icon: "settings" },
];

/** Bereichs-Navigation des Kundenportals. */
export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Kundenportal" className="-mb-px flex gap-1 overflow-x-auto">
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
