export const PROSPECT_STATUSES = ["new", "contacted", "replied", "call_booked", "won", "lost", "not_a_fit"] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export type Audit = {
  checked: boolean;
  reachable: boolean;
  /** Site answered but refused our check (bot protection). Quality is unknown, so it isn't scored. */
  blocked: boolean;
  https: boolean;
  mobileFriendly: boolean;
  loadMs: number | null;
  hasForm: boolean;
  hasClickToCall: boolean;
  copyrightYear: number | null;
  builder: string | null; // wix, squarespace, godaddy...
  socialOnly: boolean; // "website" is just a Facebook/Instagram page
  error: string | null;
};

/** What the finder produces before it's saved. */
export type FoundProspect = {
  placeId: string;
  name: string;
  trade: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  mapsUrl: string;
  rating: number | null;
  reviewCount: number;
  audit: Audit;
  findings: string[];
  score: number;
};

export type Prospect = FoundProspect & {
  id: string;
  createdAt: string;
  status: ProspectStatus;
  notes: string;
  previewSlug: string;
  previewViews: number;
  lastViewedAt: string | null;
  lastContactedAt: string | null;
};
