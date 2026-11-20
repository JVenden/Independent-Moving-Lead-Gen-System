import type { FoundProspect } from "./types";
import { scoreProspect } from "./score";

/** Fictional sample businesses for demo mode. Not real companies. */
const base = { checked: true, blocked: false, error: null, builder: null, socialOnly: false, copyrightYear: null } as const;

const samples: Omit<FoundProspect, "findings" | "score">[] = [
  {
    placeId: "demo-1", name: "Sample Roofing Co.", trade: "roofers", city: "Columbus, WI",
    address: "100 Example St, Columbus, WI", phone: "(555) 010-0001", website: "", mapsUrl: "",
    rating: 4.8, reviewCount: 41,
    audit: { ...base, reachable: false, https: false, mobileFriendly: false, loadMs: null, hasForm: false, hasClickToCall: false },
  },
  {
    placeId: "demo-2", name: "Example Plumbing & Drain", trade: "plumbers", city: "Columbus, WI",
    address: "200 Example Ave, Columbus, WI", phone: "(555) 010-0002", website: "http://example.com/plumbing", mapsUrl: "",
    rating: 4.6, reviewCount: 23,
    audit: { ...base, reachable: true, https: false, mobileFriendly: false, loadMs: 4200, hasForm: false, hasClickToCall: false, copyrightYear: 2017, builder: "GoDaddy builder" },
  },
  {
    placeId: "demo-3", name: "Demo Lawn & Snow", trade: "landscapers", city: "Columbus, WI",
    address: "300 Example Rd, Columbus, WI", phone: "(555) 010-0003", website: "https://facebook.com/example", mapsUrl: "",
    rating: 4.9, reviewCount: 12,
    audit: { ...base, reachable: true, https: true, mobileFriendly: false, loadMs: null, hasForm: false, hasClickToCall: false, socialOnly: true },
  },
  {
    placeId: "demo-4", name: "Placeholder Heating & Air", trade: "hvac", city: "Columbus, WI",
    address: "400 Example Blvd, Columbus, WI", phone: "(555) 010-0004", website: "https://example.com/hvac", mapsUrl: "",
    rating: 4.2, reviewCount: 3,
    audit: { ...base, reachable: true, https: true, mobileFriendly: true, loadMs: 1800, hasForm: false, hasClickToCall: true, copyrightYear: 2021, builder: "Wix" },
  },
  {
    placeId: "demo-5", name: "Test Town Movers", trade: "movers", city: "Columbus, WI",
    address: "500 Example Ln, Columbus, WI", phone: "(555) 010-0005", website: "https://example.com/movers", mapsUrl: "",
    rating: 4.7, reviewCount: 88,
    audit: { ...base, reachable: true, https: true, mobileFriendly: true, loadMs: 900, hasForm: true, hasClickToCall: true, copyrightYear: 2026 },
  },
];

export const DEMO_PROSPECTS: FoundProspect[] = samples.map((s) => ({
  ...s,
  ...scoreProspect(s.audit, !!s.website, s.rating, s.reviewCount),
}));
