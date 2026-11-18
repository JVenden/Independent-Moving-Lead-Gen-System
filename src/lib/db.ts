import type { LeadFormValues } from "./schema";
import type { Quote } from "./pricing";

/**
 * Saves a lead to Supabase via its REST API (no extra dependency needed).
 * Uses the service role key, so this must only ever run on the server.
 * Table definition: supabase/schema.sql
 */
export async function saveLead(lead: LeadFormValues, quote: Quote): Promise<{ id: string | null }> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
    }
    console.warn("[dev] Supabase not configured; lead not saved:", lead.fullName);
    return { id: null };
  }

  const res = await fetch(`${url}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      service_type: lead.serviceType,
      labor_type: lead.serviceType === "labor_only" ? lead.laborType : null,
      from_zip: lead.fromZip,
      to_zip: lead.toZip || null,
      home_size: lead.homeSize,
      stairs: lead.stairs,
      packing: lead.packing,
      heavy_items: lead.heavyItems,
      move_date: lead.moveDate,
      full_name: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      sms_consent: lead.smsConsent,
      source: lead.referralSource || "website",
      distance_miles: quote.miles,
      distance_band: quote.band,
      quote_min: quote.min,
      quote_max: quote.max,
      needs_review: quote.needsReview,
    }),
  });

  if (!res.ok) {
    throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
  }
  const rows = (await res.json()) as { id: string }[];
  return { id: rows[0]?.id ?? null };
}
