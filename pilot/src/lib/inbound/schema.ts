import { z } from "zod";

export const PROJECT_TYPES = ["lead_gen_funnel", "full_website", "landing_page", "local_seo_marketing"] as const;
export const GOALS = ["more_leads", "automate_booking", "rank_on_google", "modernize_brand"] as const;
export const TIMELINES = ["asap", "within_30_days", "1_to_3_months", "just_exploring"] as const;

const base = z.object({
  // Step 1
  projectType: z.enum(PROJECT_TYPES, { required_error: "Please select the main service you need." }),
  industry: z.string().trim().max(80).optional().default(""),
  currentWebsite: z.string().trim().max(200).optional().default(""),

  // Step 2
  primaryGoal: z.enum(GOALS, { required_error: "Please select your main goal." }),
  timeline: z.enum(TIMELINES, { required_error: "Please select a timeline." }),

  // Step 3
  businessName: z.string().trim().min(2, "Business name is required").max(120),
  fullName: z.string().trim().min(2, "Your name is required").max(100),
  phone: z
    .string()
    .transform((p) => p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, ""))
    .pipe(z.string().length(10, "Enter a valid 10-digit phone number")),
  email: z.string().trim().email("Enter a valid email address"),
  smsConsent: z.boolean().default(false),

  /** Prospect preview slug, when they arrive from their personalized preview. */
  ref: z.string().max(64).optional().default(""),
  /** Honeypot: hidden from people, bots fill it in. */
  nickname: z.string().max(0).optional(),
});

export const inboundSchema = base;

export const stepSchemas = {
  1: base.pick({ projectType: true, industry: true, currentWebsite: true }),
  2: base.pick({ primaryGoal: true, timeline: true }),
  3: base.pick({ businessName: true, fullName: true, phone: true, email: true, smsConsent: true, nickname: true }),
} as const;

export type InboundInput = z.input<typeof inboundSchema>;
export type InboundValues = z.output<typeof inboundSchema>;

export const LABELS: Record<string, string> = {
  lead_gen_funnel: "Website + instant quotes + lead alerts",
  full_website: "Full multi-page website",
  landing_page: "Single high-converting landing page",
  local_seo_marketing: "Local Google SEO & Maps",
  more_leads: "More exclusive local leads",
  automate_booking: "Automate quotes & follow-up",
  rank_on_google: "Rank higher on Google & Maps",
  modernize_brand: "Replace an outdated site",
  asap: "ASAP (this week)",
  within_30_days: "Within 30 days",
  "1_to_3_months": "1–3 months",
  just_exploring: "Just pricing options",
};
