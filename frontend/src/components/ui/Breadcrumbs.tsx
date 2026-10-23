import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Sichtbare Brotkrumen auf dunklem Grund – dieselben Einträge wie das BreadcrumbList-JSON-LD der Seite.
 * Der letzte Eintrag ist die aktuelle Seite (kein Link).
 */
export function Breadcrumbs({ items, label, className }: { items: Crumb[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-400">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-slate-200">
                {item.label}
              </span>
            ) : (
              <SmartLink href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </SmartLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
