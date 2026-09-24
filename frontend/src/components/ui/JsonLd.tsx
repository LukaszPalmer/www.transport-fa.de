import { serializeJsonLd } from "@/lib/structured-data";

/** Strukturierte Daten (schema.org) als sicher serialisiertes JSON-LD. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
