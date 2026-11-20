/**
 * Single source of truth for the product + agency identity.
 * Renaming the product (e.g. P.I.L.O.T. → Porchlight) is a one-line change here.
 *
 * TODO: replace every placeholder before launch.
 */
export const BRAND = {
  /** Product name shown in the admin dashboard and page titles. */
  product: "P.I.L.O.T.",
  productTagline: "Prospect Identification, Layout & Outreach Technology",

  /** Your agency (what prospects and clients see). */
  agencyName: "Your Agency Name",
  ownerFirstName: "Your Name",
  phone: "(555) 555-5555",
  email: "",
  siteUrl: "https://example.com", // final production URL, no trailing slash
  city: "Columbus",
  region: "WI",

  /**
   * Physical mailing address. US law (CAN-SPAM) requires it in every
   * commercial cold email, so outreach templates include it.
   */
  mailingAddress: "",

  /** Your proof. Update with real numbers as soon as you have them. */
  caseStudy: {
    client: "A local moving company",
    url: "", // e.g. the live moving site
    summary:
      "Instant-quote website that texts the owner every new lead in seconds, plus local SEO pages and a one-tap review link.",
    result: "", // e.g. "27 booked jobs in the first 60 days". Leave blank until it's real.
  },
} as const;

export const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;

export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
}
