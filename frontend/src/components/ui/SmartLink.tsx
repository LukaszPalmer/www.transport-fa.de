import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** Nur für interne Routen: false für dynamische Seiten (z. B. Kundenportal). */
  prefetch?: boolean;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);
const isNative = (href: string) => /^(\/?#|mailto:|tel:)/.test(href) || href.endsWith(".xml");

/**
 * Ein Link-Primitive für alle Ziele:
 * - interne Routen    → next/link (Prefetching, Client-Navigation)
 * - #Anker und /#Anker, mailto:, tel:, Dateien → natives <a>
 *   (Sprungmarken brauchen keinen Router; spart RSC-Prefetches der Startseite)
 * - externe URLs      → neues Tab mit sicherem rel-Attribut
 */
export function SmartLink({ href, children, prefetch, ...props }: SmartLinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  if (isNative(href)) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}
