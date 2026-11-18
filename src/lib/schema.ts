import { z } from "zod";

const zip = z.string().regex(/^\d{5}$/, "Must be a valid 5-digit zip code");

export const SERVICE_TYPES = ["labor_only", "full_service"] as const;
export const LABOR_TYPES = ["load", "unload", "both"] as const;
export const HOME_SIZES = ["studio_1bed", "2bed", "3bed", "4plus_bed"] as const;
export const STAIRS = ["none", "1flight", "2plus", "elevator"] as const;
export const PACKING = ["none", "partial", "full"] as const;
export const HEAVY_ITEMS = ["piano", "safe", "pool_table", "hot_tub", "other"] as const;

const baseSchema = z.object({
  // Step 1
  serviceType: z.enum(SERVICE_TYPES, { required_error: "Please select a service type." }),
  laborType: z.enum(LABOR_TYPES).optional(),
  fromZip: zip,
  toZip: z.union([zip, z.literal("")]).optional(),

  // Step 2
  homeSize: z.enum(HOME_SIZES, { required_error: "Please select your home size." }),
  stairs: z.enum(STAIRS).default("none"),
  packing: z.enum(PACKING).default("none"),
  heavyItems: z.array(z.enum(HEAVY_ITEMS)).default([]),
  moveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a target move date")
    // 36h of slack so a "today" date in US time zones isn't rejected by a UTC server
    .refine((d) => new Date(`${d}T00:00:00Z`).getTime() >= Date.now() - 36 * 3600 * 1000, {
      message: "Move date can't be in the past",
    }),

  // Step 3
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .transform((p) => p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, ""))
    .pipe(z.string().length(10, "Enter a valid 10-digit phone number")),
  email: z.union([z.string().trim().email("Invalid email address"), z.literal("")]).optional(),
  smsConsent: z.boolean().default(false),
  referralSource: z.string().max(100).optional(),
  website: z.string().max(0).optional(), // honeypot: hidden field, real users leave it blank
});

type BaseValues = z.infer<typeof baseSchema>;

/** Does this job need a destination zip? (full service, or labor at both ends) */
export function needsDestination(v: Pick<BaseValues, "serviceType" | "laborType">) {
  return v.serviceType === "full_service" || v.laborType === "both";
}

function crossFieldRules(
  v: Pick<BaseValues, "serviceType" | "laborType" | "toZip">,
  ctx: z.RefinementCtx
) {
  if (v.serviceType === "labor_only" && !v.laborType) {
    ctx.addIssue({ code: "custom", path: ["laborType"], message: "Choose load, unload, or both" });
  }
  if (needsDestination(v) && !v.toZip) {
    ctx.addIssue({ code: "custom", path: ["toZip"], message: "Destination zip is required" });
  }
}

export const leadFormSchema = baseSchema.superRefine(crossFieldRules);

/**
 * Per-step schemas. The wizard validates each step on its own so the
 * cross-field rules (laborType / toZip) fire on step 1, where those fields
 * are actually visible, instead of only at final submit.
 */
export const stepSchemas = {
  1: baseSchema
    .pick({ serviceType: true, laborType: true, fromZip: true, toZip: true })
    .superRefine(crossFieldRules),
  2: baseSchema.pick({ homeSize: true, stairs: true, packing: true, heavyItems: true, moveDate: true }),
  3: baseSchema.pick({
    fullName: true,
    phone: true,
    email: true,
    smsConsent: true,
    referralSource: true,
    website: true,
  }),
} as const;

/** Values as the form holds them (before transforms/defaults). */
export type LeadFormInput = z.input<typeof leadFormSchema>;
/** Values after validation (phone normalized, defaults applied). */
export type LeadFormValues = z.output<typeof leadFormSchema>;
