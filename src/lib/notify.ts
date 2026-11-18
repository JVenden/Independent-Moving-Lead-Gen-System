import type { LeadFormValues } from "./schema";
import type { Quote } from "./pricing";

const LABELS: Record<string, string> = {
  labor_only: "Labor only",
  full_service: "Full service",
  load: "load",
  unload: "unload",
  both: "load + unload",
  studio_1bed: "Studio/1BR",
  "2bed": "2BR",
  "3bed": "3BR",
  "4plus_bed": "4+BR",
  none: "none",
  "1flight": "1 flight",
  "2plus": "2+ flights",
  elevator: "elevator",
  partial: "partial",
  full: "full",
};
const label = (k: string) => LABELS[k] ?? k;

function formatPhone(p: string) {
  return `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`;
}

export function formatLeadMessage(lead: LeadFormValues, quote: Quote) {
  const service =
    lead.serviceType === "labor_only"
      ? `${label(lead.serviceType)} (${label(lead.laborType ?? "")})`
      : label(lead.serviceType);
  const route = lead.toZip ? `${lead.fromZip} → ${lead.toZip}` : lead.fromZip;

  return [
    `🚚 NEW LEAD${quote.needsReview ? " ⚠️ REVIEW PRICE" : ""}`,
    `${lead.fullName} — ${formatPhone(lead.phone)}`,
    lead.email ? `Email: ${lead.email}` : null,
    `${service}, ${label(lead.homeSize)}`,
    `Date: ${lead.moveDate}`,
    `Zip: ${route}${quote.miles !== null ? ` (~${quote.miles} mi)` : ""}`,
    `Stairs: ${label(lead.stairs)} | Packing: ${label(lead.packing)}`,
    lead.heavyItems.length ? `Heavy: ${lead.heavyItems.join(", ")}` : null,
    `Quoted: $${quote.min}–$${quote.max}`,
    lead.smsConsent ? "✅ OK to text" : "📞 Call only (no SMS consent)",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) throw new Error(`Telegram failed: ${res.status} ${await res.text()}`);
  return true;
}

async function sendEmailToSms(text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.DISPATCH_SMS_GATEWAY ?? process.env.FRIEND_CARRIER_GATEWAY;
  if (!apiKey || !from || !to) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [to], subject: "New moving lead", text }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
  return true;
}

/**
 * Sends the lead alert to every configured channel.
 * Throws only if no channel delivered it.
 */
export async function notifyDispatch(lead: LeadFormValues, quote: Quote) {
  const text = formatLeadMessage(lead, quote);
  const results = await Promise.allSettled([sendTelegram(text), sendEmailToSms(text)]);

  const delivered = results.some((r) => r.status === "fulfilled" && r.value === true);
  const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  errors.forEach((e) => console.error("[notify]", e.reason));

  if (!delivered) {
    if (errors.length === 0) console.warn("[notify] No alert channel configured.\n" + text);
    throw new Error("Lead alert was not delivered on any channel");
  }
}
