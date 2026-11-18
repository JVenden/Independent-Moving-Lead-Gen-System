"use client";

import type { Quote } from "@/lib/pricing";
import type { LeadFormInput } from "@/lib/schema";
import { BUSINESS, telHref } from "@/lib/business";

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function StepSuccess({
  quote,
  serviceType,
  moveDate,
}: {
  quote: Quote | null;
  serviceType: LeadFormInput["serviceType"];
  moveDate: string;
}) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
        ✓
      </div>

      {quote ? (
        <>
          <h3 className="text-2xl font-bold text-slate-800">Your Estimate Is Ready!</h3>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-xs mx-auto">
            <span className="text-3xl font-extrabold text-blue-600">
              ${quote.min.toLocaleString()} – ${quote.max.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {serviceType === "full_service"
                ? "Includes truck, professional crew & equipment"
                : "Includes professional crew & equipment (you provide the truck)"}
            </p>
            {quote.miles !== null && (
              <p className="text-xs text-slate-500 mt-1">Approx. {quote.miles} miles between ZIP codes</p>
            )}
          </div>

          {quote.needsReview && (
            <p className="text-sm text-amber-700">
              Your move is outside our usual area or includes special items, so we&apos;ll confirm the
              final price with you.
            </p>
          )}
        </>
      ) : (
        <h3 className="text-2xl font-bold text-slate-800">Thanks! We got your request.</h3>
      )}

      <div className="text-left bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-sm mx-auto">
        <p className="text-sm font-semibold text-slate-800 mb-2">What happens next</p>
        <ol className="space-y-1.5 text-sm text-slate-600 list-decimal list-inside">
          <li>
            We&apos;ll call or text you {BUSINESS.responsePromise} to confirm details.
          </li>
          {moveDate && (
            <li>
              We&apos;re penciling you in for <strong>{formatDate(moveDate)}</strong> while we confirm.
            </li>
          )}
          <li>Once confirmed, your date is locked in.</li>
        </ol>
      </div>

      {BUSINESS.phone && (
        <p className="text-sm text-slate-500">
          Want to lock it in right now? Call{" "}
          <a href={telHref(BUSINESS.phone)} className="font-semibold text-blue-600 whitespace-nowrap">
            {BUSINESS.phone}
          </a>
        </p>
      )}
    </div>
  );
}
