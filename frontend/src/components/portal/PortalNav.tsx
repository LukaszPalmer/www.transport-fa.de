"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/content/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Übersicht", href: routes.portal, icon: "house" },
  { label: "Mein Konto", href: routes.portalAccount, icon: "users" },
];

/** Bereichs-Navigation des Kundenportals (weitere Bereiche folgen mit den Modulen). */
export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Kundenportal" className="-mb-px flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = pathname === item.href;
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
