/**
 * Google Places API (New): Text Search.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 *
 * Asking for phone/website/rating puts each request in a higher pricing tier.
 * Google includes a monthly free allowance per tier; check current pricing and
 * set a budget alert in Google Cloud before running lots of searches.
 */
export type Place = {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  mapsUrl: string;
  rating: number | null;
  reviewCount: number;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",");

type ApiPlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
};

export async function searchPlaces(query: string, maxResults = 20): Promise<Place[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const out: Place[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
      body: JSON.stringify({ textQuery: query, pageSize: Math.min(20, maxResults), ...(pageToken ? { pageToken } : {}) }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Places search failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { places?: ApiPlace[]; nextPageToken?: string };

    for (const p of data.places ?? []) {
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
      out.push({
        placeId: p.id,
        name: p.displayName?.text ?? "Unknown business",
        address: p.formattedAddress ?? "",
        phone: p.nationalPhoneNumber ?? "",
        website: p.websiteUri ?? "",
        mapsUrl: p.googleMapsUri ?? "",
        rating: p.rating ?? null,
        reviewCount: p.userRatingCount ?? 0,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken && out.length < maxResults);

  return out.slice(0, maxResults);
}
