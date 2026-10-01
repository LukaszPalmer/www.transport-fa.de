import "server-only";
import type { Review } from "@/types/content";
import { excludedReviewAuthors, googlePlaceId } from "@/content/reviews";

/**
 * Google-Bewertungen live über die Places API (New) – Place Details mit Feldmaske.
 * Die API liefert die Gesamtnote und höchstens 5 Bewertungen (von Google ausgewählt).
 * Abrechnung: SKU „Place Details Enterprise + Atmosphere"; bei 4 Abrufen/Tag innerhalb des Freikontingents.
 *
 * Ohne Place-ID oder GOOGLE_PLACES_API_KEY – oder bei einem Fehler – liefert die Funktion null,
 * die Seite zeigt dann den Einladungs-Zustand. Ein API-Ausfall bricht die Seite nie.
 */

const REVALIDATE_SECONDS = 6 * 60 * 60;

/** Namen vergleichbar machen: Kleinschreibung, ohne Akzente, in Wörter zerlegt. */
function nameWords(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
}

function isExcludedAuthor(author: string): boolean {
  const words = nameWords(author);
  return excludedReviewAuthors.some((entry) => nameWords(entry).every((word) => words.includes(word)));
}

interface PlacesReview {
  rating?: number;
  publishTime?: string;
  googleMapsUri?: string;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string; uri?: string };
}

interface PlaceDetails {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
}

export interface GoogleReviewData {
  rating?: { value: number; count: number; asOf: string };
  profileUrl?: string;
  reviews: Review[];
}

export async function getGoogleReviews(): Promise<GoogleReviewData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !googlePlaceId) return null;

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}?languageCode=de`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["google-reviews"] },
    });
    if (!response.ok) {
      console.error("[Google-Bewertungen]", response.status, await response.text());
      return null;
    }
    const place = (await response.json()) as PlaceDetails;
    // Stand = Abrufzeit bei Google (bleibt im Cache erhalten), nicht die Renderzeit.
    const asOf = new Date(response.headers.get("date") ?? Date.now()).toISOString();

    const ownReviews = (place.reviews ?? []).filter((review) => isExcludedAuthor(review.authorAttribution?.displayName ?? ""));
    const reviews = (place.reviews ?? []).flatMap((review, index): Review[] => {
      // Originaltext statt Googles Übersetzung – Bewertungen erscheinen unverändert.
      const original = review.originalText ?? review.text;
      const text = original?.text?.trim();
      const author = review.authorAttribution?.displayName?.trim();
      const rating = Math.round(review.rating ?? 0);
      if (!text || !author || !review.publishTime || rating < 1 || rating > 5) return [];
      if (isExcludedAuthor(author)) return [];
      return [
        {
          id: `google-${review.publishTime}-${index}`,
          source: "google",
          author,
          authorUrl: review.authorAttribution?.uri,
          rating: rating as Review["rating"],
          date: review.publishTime,
          text,
          lang: original?.languageCode,
          url: review.googleMapsUri,
        },
      ];
    });

    return {
      // Googles Gesamtnote enthält auch Bewertungen aus dem eigenen Haus – solange eine davon
      // sichtbar ist, zeigen wir keine Gesamtnote (wir dürfen sie weder übernehmen noch umrechnen).
      rating:
        ownReviews.length === 0 && place.rating && place.userRatingCount
          ? { value: place.rating, count: place.userRatingCount, asOf }
          : undefined,
      profileUrl: place.googleMapsUri,
      reviews,
    };
  } catch (error) {
    console.error("[Google-Bewertungen]", error);
    return null;
  }
}
