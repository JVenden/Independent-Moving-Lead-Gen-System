/**
 * Local SEO landing pages, e.g. /labor-only-movers-columbus-wi
 *
 * Google ranks these only if each one is genuinely local and unique. Do NOT
 * copy-paste the same text with the city name swapped: that's "doorway page"
 * spam and can hurt the whole site. Write each intro from real experience:
 * neighborhoods, apartment complexes, stairs/parking quirks, typical jobs.
 *
 * Pages with `draft: true` are NOT built or listed in the sitemap.
 * Flip to `draft: false` once the content is real (aim for 300–500 words).
 */

export type ServiceKind = "labor_only" | "apartment" | "same_day" | "general";

export type LocationPage = {
  slug: string; // the URL, e.g. "labor-only-movers-columbus-wi"
  draft: boolean;
  service: ServiceKind;
  city: string;
  state: string;
  zip: string; // pre-fills the form
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[]; // paragraphs of real local content
  neighborhoods?: string[];
  faqs?: { q: string; a: string }[];
};

export const SERVICE_LABEL: Record<ServiceKind, string> = {
  labor_only: "Labor-Only Movers",
  apartment: "Apartment Movers",
  same_day: "Same-Day Movers",
  general: "Movers",
};

export const LOCATIONS: LocationPage[] = [
  {
    slug: "labor-only-movers-columbus-wi",
    draft: true, // TODO: write real content, then set to false
    service: "labor_only",
    city: "Columbus",
    state: "WI",
    zip: "53925",
    h1: "Labor-Only Movers in Columbus, WI",
    metaTitle: "Labor-Only Movers in Columbus, WI | Instant Quote",
    metaDescription:
      "Rented a U-Haul or Penske? Our local crew loads and unloads it for you in Columbus, WI. Get an instant price online.",
    intro: [
      "TODO: 2–4 short paragraphs in the owner's own words. Which parts of town do you work in most? Which apartment complexes have tricky stairs or loading docks? How many Columbus moves have you done? What's a typical labor-only job (e.g. a 2-bedroom U-Haul load in about 3 hours)?",
      "TODO: Mention nearby towns you also cover, and anything that sets you apart (same crew every time, blankets & dollies included, weekend availability).",
    ],
    neighborhoods: ["TODO: real neighborhood", "TODO: real apartment complex"],
    faqs: [
      { q: "Do you provide the truck?", a: "For labor-only jobs you rent the truck (U-Haul, Penske, Budget) and we bring the crew, dollies, and pads. Need a truck too? Choose Full Service in the form." },
      { q: "How much does it cost to load a 2-bedroom?", a: "Use the instant quote above. You'll see a price range in under a minute, based on home size, stairs, and any heavy items." },
    ],
  },
  {
    slug: "same-day-movers-fort-atkinson-wi",
    draft: true,
    service: "same_day",
    city: "Fort Atkinson",
    state: "WI",
    zip: "53538",
    h1: "Same-Day Moving Help in Fort Atkinson, WI",
    metaTitle: "Same-Day Movers in Fort Atkinson, WI | Instant Quote",
    metaDescription:
      "Need movers today? Local crew available for same-day loading, unloading, and small moves in Fort Atkinson, WI.",
    intro: ["TODO: real local content."],
  },
];

export const PUBLISHED_LOCATIONS = LOCATIONS.filter((l) => !l.draft);

export function getLocation(slug: string) {
  return PUBLISHED_LOCATIONS.find((l) => l.slug === slug);
}
