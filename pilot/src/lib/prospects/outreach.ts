import { BRAND, formatPhone } from "@/lib/brand";
import type { Prospect } from "./types";

export const previewUrl = (p: Prospect) => `${BRAND.siteUrl}/p/${p.previewSlug}`;

function topFindings(p: Prospect, n = 2) {
  return p.findings.slice(0, n).map((f) => `• ${f}`).join("\n");
}

/**
 * Cold email. Keep it short, specific, and honest.
 * CAN-SPAM: real sender, honest subject, your mailing address, and a way to opt out.
 */
export function coldEmail(p: Prospect) {
  const subject = `Quick idea for ${p.name}`;
  const body = `Hi there,

I was looking up ${p.name} on Google and noticed a couple of things that are probably costing you calls:

${topFindings(p) || "• Your site could be turning more visitors into quote requests"}

So I put together a free preview of what your site could look like, with an instant-quote form that texts new leads straight to your phone:

${previewUrl(p)}

No cost to look. If you like it, I'd be glad to walk you through it in 10 minutes.

${BRAND.ownerFirstName}
${BRAND.agencyName} · ${BRAND.phone}
${BRAND.mailingAddress || "[YOUR MAILING ADDRESS: required by law]"}

Not interested? Just reply "no thanks" and I won't email again.`;
  return { subject, body };
}

export function callScript(p: Prospect) {
  return `Hi, is this the owner of ${p.name}? This is ${BRAND.ownerFirstName} with ${BRAND.agencyName}, here in ${BRAND.city}.

I'll be quick. I build websites for local ${p.trade} companies that text the owner every new quote request in seconds.

I looked you up on Google and noticed:
${topFindings(p, 3) || "• (no major issues found: lead with the instant-quote + text alert angle)"}
${p.rating && p.reviewCount >= 10 ? `\nYou've got great reviews (${p.rating}★ from ${p.reviewCount} people), so you're probably losing work to companies with better websites, not better service.\n` : ""}
I actually made a free preview of what your site could look like. Can I text or email you the link? It takes 30 seconds to look at.

→ If yes: get their email/cell, send the preview, mark "contacted".
→ If "how much": "Setup starts around $500 and hosting with lead alerts is a small monthly fee. Want to see the preview first?"
→ If no: "No problem, thanks for your time." Mark "not a fit".

Their number: ${formatPhone(p.phone)}`;
}

/** Only send a text after they've given you their cell number / said yes on a call. */
export function followUpText(p: Prospect) {
  return `Hi, it's ${BRAND.ownerFirstName} from ${BRAND.agencyName}. Here's the free preview I made for ${p.name}: ${previewUrl(p)} Let me know what you think!`;
}
