import type { LeadFormInput } from "./schema";
import type { Quote } from "./pricing";

export type SubmitLeadResponse = { success: true; quote: Quote | null };

export async function submitLead(data: LeadFormInput): Promise<SubmitLeadResponse> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to submit your request.");
  }
  return response.json();
}
