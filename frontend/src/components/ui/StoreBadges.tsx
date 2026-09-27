import Image from "next/image";
import { trackingApp } from "@/content/app";
import { cn } from "@/lib/cn";
import { ComingSoon } from "./ComingSoon";
import { SmartLink } from "./SmartLink";

/**
 * Originale Store-Badges (unverändert, gleiche Höhe laut Apple-/Google-Richtlinien).
 * Ohne Store-Link: kein Link, Hinweis „Demnächst verfügbar" plus Tooltip.
 */
export function StoreBadges({
  height = 48,
  label = "Demnächst verfügbar",
  tooltip = "App folgt in Kürze",
  className,
}: {
  height?: number;
  label?: string;
  tooltip?: string;
  className?: string;
}) {
  const stores = Object.values(trackingApp.stores);
  const comingSoon = stores.some((store) => !store.href);
  return (
    <div className={className}>
      {comingSoon && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold tracking-wide text-accent-ink uppercase">
          <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent-ink" />
          {label}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {stores.map((store) => {
          const badge = (
            <Image
              src={store.badge.src}
              alt=""
              width={Math.round((store.badge.width / store.badge.height) * height)}
              height={height}
              unoptimized
              className={cn("block w-auto", !store.href && "opacity-90")}
              style={{ height }}
            />
          );
          return store.href ? (
            <SmartLink
              key={store.name}
              href={store.href}
              aria-label={store.label}
              className="rounded-[10px] transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              {badge}
            </SmartLink>
          ) : (
            <ComingSoon key={store.name} id={`store-${store.name}`} label={`${store.name} – ${label}`} tooltip={tooltip} className="rounded-[10px]">
              {badge}
            </ComingSoon>
          );
        })}
      </div>
    </div>
  );
}
