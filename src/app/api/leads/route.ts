import { NextResponse } from "next/server";
import { leadFormSchema, needsDestination } from "@/lib/schema";
import { calculateQuote } from "@/lib/pricing";
import { saveLead } from "@/lib/db";
import { notifyDispatch } from "@/lib/notify";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot filled → almost certainly a bot. Pretend success so it moves on.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ success: true, quote: null });
  }

  // Same schema as the browser, so the API can't be fed junk directly.
  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lead = parsed.data;
  if (!needsDestination(lead)) lead.toZip = ""; // single-address labor job: ignore stray toZip
  if (lead.serviceType !== "labor_only") lead.laborType = undefined;

  const quote = calculateQuote(lead);

  // Demo mode: show the quote, but don't save or alert (no accounts needed).
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ success: true, quote });
  }

  // 1. Save first: a lead must never exist only as a notification.
  try {
    await saveLead(lead, quote);
  } catch (err) {
    console.error("[leads] save failed", err);
    // Still try to alert dispatch so the lead isn't lost entirely.
    await notifyDispatch(lead, quote).catch((e) => console.error("[leads] notify also failed", e));
    return NextResponse.json(
      { error: "We couldn't save your request. Please call us directly." },
      { status: 500 }
    );
  }

  // 2. Alert dispatch. The lead is already saved, so don't fail the customer over this.
  await notifyDispatch(lead, quote).catch((err) => console.error("[leads] notify failed", err));

  return NextResponse.json({ success: true, quote });
}
