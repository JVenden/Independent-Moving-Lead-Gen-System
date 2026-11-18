import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BUSINESS, telHref } from "@/lib/business";

export const metadata: Metadata = {
  title: `Leave a review | ${BUSINESS.name}`,
  robots: { index: false }, // utility page, keep out of search results
};

/**
 * Short, memorable link to text customers after every job: yoursite.com/review
 * Redirects straight to the Google review form once googleReviewUrl is set.
 */
export default function ReviewPage() {
  if (BUSINESS.googleReviewUrl) redirect(BUSINESS.googleReviewUrl);

  return (
    <main className="px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Thanks for choosing {BUSINESS.name}!</h1>
      <p className="mt-3 text-slate-600">
        Our review link isn&apos;t set up yet. Questions? Call{" "}
        <a href={telHref(BUSINESS.phone)} className="font-semibold text-blue-600">
          {BUSINESS.phone}
        </a>
        .
      </p>
    </main>
  );
}
