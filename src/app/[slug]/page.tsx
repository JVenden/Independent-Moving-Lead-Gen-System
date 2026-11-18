import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadFormWizard } from "@/components/lead-form/LeadFormWizard";
import { PUBLISHED_LOCATIONS, getLocation } from "@/content/locations";
import { BUSINESS, telHref } from "@/lib/business";

// Only build pages listed (and not draft) in src/content/locations.ts
export const dynamicParams = false;

export function generateStaticParams() {
  return PUBLISHED_LOCATIONS.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const loc = getLocation(params.slug);
  if (!loc) return {};
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: `${BUSINESS.siteUrl}/${loc.slug}` },
  };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const loc = getLocation(params.slug);
  if (!loc) notFound();

  const faqJsonLd = loc.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: loc.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <main className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{loc.h1}</h1>
        <p className="mt-3 text-slate-600">
          Instant price in under a minute, or call{" "}
          <a href={telHref(BUSINESS.phone)} className="font-semibold text-blue-600">
            {BUSINESS.phone}
          </a>
        </p>
      </div>

      <LeadFormWizard
        defaultServiceType={loc.service === "labor_only" ? "labor_only" : "full_service"}
        defaultFromZip={loc.zip}
      />

      <article className="mx-auto max-w-2xl mt-14 space-y-4 text-slate-700 leading-relaxed">
        {loc.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {loc.neighborhoods?.length ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 pt-4">Areas we serve around {loc.city}</h2>
            <ul className="list-disc list-inside">
              {loc.neighborhoods.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        ) : null}

        {loc.faqs?.length ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 pt-4">Common questions</h2>
            {loc.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-slate-900">{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </>
        ) : null}
      </article>

      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
    </main>
  );
}
