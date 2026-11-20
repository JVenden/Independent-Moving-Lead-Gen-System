import { NextResponse } from "next/server";
import { inboundSchema, LABELS } from "@/lib/inbound/schema";
import { estimate } from "@/lib/inbound/pricing";
import { hasDb, sb } from "@/lib/supabase";
import { sendAlert } from "@/lib/notify";
import { formatPhone, isDemo } from "@/lib/brand";
import { getProspectBySlug, updateProspect } from "@/lib/prospects/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot filled → bot. Pretend success.
  if (typeof body.nickname === "string" && body.nickname.length > 0) {
    return NextResponse.json({ success: true, estimate: null });
  }

  const parsed = inboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const lead = parsed.data;
  const est = estimate(lead);

  if (isDemo()) return NextResponse.json({ success: true, estimate: est });

  // Did this lead come from a prospect's personalized preview?
  const prospect = lead.ref ? await getProspectBySlug(lead.ref).catch(() => null) : null;

  const tag = est.priority === "hot" ? "🔥 HOT" : est.priority === "warm" ? "🟠 WARM" : "🔵";
  const alertText = [
    `${tag} NEW CLIENT LEAD${prospect ? " (from your outreach!)" : ""}`,
    `${lead.businessName}${lead.industry ? ` (${lead.industry})` : ""}`,
    `${lead.fullName}: ${formatPhone(lead.phone)} · ${lead.email}`,
    `Wants: ${LABELS[lead.projectType]}`,
    `Goal: ${LABELS[lead.primaryGoal]} · Timeline: ${LABELS[lead.timeline]}`,
    `Current site: ${lead.currentWebsite || "none"}`,
    `Quoted: $${est.setupMin}–$${est.setupMax} + $${est.monthly}/mo`,
    lead.smsConsent ? "✅ OK to text" : "📞 Call/email only (no SMS consent)",
  ].join("\n");

  // 1. Save first: a lead must never exist only as a notification.
  try {
    if (hasDb()) {
      await sb("inbound_leads", {
        method: "POST",
        body: {
          project_type: lead.projectType,
          industry: lead.industry || null,
          current_website: lead.currentWebsite || null,
          primary_goal: lead.primaryGoal,
          timeline: lead.timeline,
          business_name: lead.businessName,
          full_name: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          sms_consent: lead.smsConsent,
          setup_min: est.setupMin,
          setup_max: est.setupMax,
          monthly: est.monthly,
          priority: est.priority,
          prospect_id: prospect?.id ?? null,
        },
      });
    } else if (process.env.NODE_ENV === "production") {
      throw new Error("Supabase is not configured");
    } else {
      console.warn("[dev] Supabase not configured; lead not saved:\n" + alertText);
    }
  } catch (err) {
    console.error("[leads] save failed", err);
    await sendAlert("New client lead (NOT SAVED)", alertText).catch((e) => console.error("[leads] alert also failed", e));
    return NextResponse.json({ error: "We couldn't save your request. Please call us directly." }, { status: 500 });
  }

  if (prospect && ["new", "contacted"].includes(prospect.status)) {
    await updateProspect(prospect.id, { status: "replied" }).catch((e) => console.error("[leads] prospect update", e));
  }

  // 2. Alert. The lead is saved, so don't fail the customer over this.
  await sendAlert(`New client lead: ${lead.businessName}`, alertText).catch((e) => console.error("[leads] alert failed", e));

  return NextResponse.json({ success: true, estimate: est });
}
