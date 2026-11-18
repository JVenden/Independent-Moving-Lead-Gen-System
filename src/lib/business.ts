/**
 * Single source of truth for the business's Name / Address / Phone (NAP).
 *
 * Google cross-checks NAP across your site, Google Business Profile, Yelp,
 * Bing Places, Apple Maps, Facebook, Nextdoor, etc. It must match EXACTLY
 * everywhere (same spelling, same "St." vs "Street", same phone format).
 * Change it here and every page, footer and structured-data block updates.
 *
 * TODO: replace every placeholder below before launch.
 */
export const BUSINESS = {
  name: "Your Moving Co.",
  phone: "(555) 555-5555",
  email: "",
  siteUrl: "https://example.com", // final production URL, no trailing slash

  // Service-area businesses can hide their street address on GBP.
  // If you hide it there, leave streetAddress blank here too.
  streetAddress: "",
  city: "Columbus",
  region: "WI",
  postalCode: "53925",

  /** Cities shown as "areas served" (keep in sync with the GBP service area). */
  areasServed: ["Columbus, WI", "Fort Atkinson, WI"],

  /** GBP → "Ask for reviews" → copy the link (looks like https://g.page/r/XXXX/review). */
  googleReviewUrl: "",

  /** Shown on the success screen. Only promise what he can actually hit. */
  responsePromise: "within 15 minutes during business hours",

  hours: "Mo-Sa 07:00-19:00", // schema.org openingHours format
} as const;

export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;
