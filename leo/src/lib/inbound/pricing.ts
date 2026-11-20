import type { InboundValues } from "./schema";

// ⚠️ Placeholder prices. Tune to what you actually charge.
// The monthly plan is the point: recurring revenue is what a buyer pays a multiple for.

type Package = { label: string; setup: [number, number]; monthly: number; includes: string[] };

export const PACKAGES: Record<InboundValues["projectType"], Package> = {
  lead_gen_funnel: {
    label: "Lead Engine",
    setup: [1500, 3000],
    monthly: 149,
    includes: [
      "Custom fast website built for your trade",
      "Instant-quote form that pre-qualifies customers",
      "Every new lead texted to your phone in seconds",
      "Lead dashboard, hosting, updates & support",
    ],
  },
  full_website: {
    label: "Full Website",
    setup: [1200, 2500],
    monthly: 79,
    includes: ["Up to 8 custom pages", "Mobile-first and fast", "Contact form with phone alerts", "Hosting, updates & support"],
  },
  landing_page: {
    label: "Landing Page",
    setup: [500, 950],
    monthly: 49,
    includes: ["One high-converting page", "Click-to-call and quote form", "Phone alerts for new leads", "Hosting & support"],
  },
  local_seo_marketing: {
    label: "Local SEO & Maps",
    setup: [600, 1200],
    monthly: 299,
    includes: [
      "Google Business Profile setup & optimization",
      "Review-request system (one-tap review link)",
      "City/service pages that rank locally",
      "Monthly posts & ranking report",
    ],
  },
};

export type Priority = "hot" | "warm" | "cold";

export type Estimate = {
  packageLabel: string;
  setupMin: number;
  setupMax: number;
  monthly: number;
  includes: string[];
  priority: Priority;
};

export function estimate(v: Pick<InboundValues, "projectType" | "timeline">): Estimate {
  const pkg = PACKAGES[v.projectType];
  const priority: Priority =
    v.timeline === "asap" ? "hot" : v.timeline === "within_30_days" ? "warm" : v.timeline === "just_exploring" ? "cold" : "warm";
  return {
    packageLabel: pkg.label,
    setupMin: pkg.setup[0],
    setupMax: pkg.setup[1],
    monthly: pkg.monthly,
    includes: [...pkg.includes],
    priority,
  };
}
