/**
 * Store-Einträge der FA Tracking App – von der deutschen und englischen App-Vorstellung gemeinsam genutzt
 * (eigenes Modul, damit content/app.ts und content/en/app.ts sich nicht gegenseitig importieren).
 *
 * TODO(Inhalt): `href` eintragen, sobald die App veröffentlicht ist – bis dahin erscheinen die Badges
 * ohne Link mit „Demnächst verfügbar".
 */
export const appStores = {
  appStore: {
    href: undefined as string | undefined,
    name: "App Store",
    badge: { src: "/brands/app-store-badge.svg", width: 119.66, height: 40 },
  },
  googlePlay: {
    href: undefined as string | undefined,
    name: "Google Play",
    badge: { src: "/brands/google-play-badge.svg", width: 180, height: 53.333 },
  },
};
