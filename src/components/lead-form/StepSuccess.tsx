"use client";

import type { Quote } from "@/lib/pricing";
import type { LeadFormInput } from "@/lib/schema";

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE;

export function StepSuccess({
  quote,
  serviceType,
}: {
  quote: Quote | null;
  serviceType: LeadFormInput["serviceType"];
}) {
  return (
    <div className="text-center space-y-4 py-6">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
        ✓
      </div>

      {quote ? (
        <>
          <h3 className="text-2xl font-bold text-slate-800">Your Estimate Is Ready!</h3>
          <p className="text-slate-600">Based on the details you gave us, your estimated cost is:</p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-xs mx-auto">
            <span className="text-3xl font-extrabold text-blue-600">
              ${quote.min.toLocaleString()} – ${quote.max.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {serviceType === "full_service"
                ? "Includes truck, professional crew & equipment"
                : "Includes professional crew & equipment (you provide the truck)"}
            </p>
          </div>

          {quote.needsReview && (
            <p className="text-sm text-amber-700">
              Your move is outside our usual area or includes special items, so we&apos;ll confirm the final
              price with you.
            </p>
          )}
        </>
      ) : (
        <h3 className="text-2xl font-bold text-slate-800">Thanks! We got your request.</h3>
      )}

      <p className="text-sm text-slate-500 mt-4">
        Our dispatcher has your details and will reach out shortly to confirm your date.
        {BUSINESS_PHONE && (
          <>
            {" "}Want to lock it in now? Call{" "}
            <a href={`tel:${BUSINESS_PHONE.replace(/\D/g, "")}`} className="font-semibold text-blue-600">
              {BUSINESS_PHONE}
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
