/** Verbindet bedingte CSS-Klassen zu einem String (leichtgewichtige clsx-Alternative). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
