import Link from "next/link";
import { BUSINESS, telHref } from "@/lib/business";
import { PUBLISHED_LOCATIONS } from "@/content/locations";

export function SiteFooter() {
  const address = [BUSINESS.streetAddress, `${BUSINESS.city}, ${BUSINESS.region} ${BUSINESS.postalCode}`]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-4xl px-4 py-8 grid gap-6 sm:grid-cols-2 text-sm text-slate-600">
        {/* NAP: must match Google Business Profile exactly */}
        <div>
          <p className="font-semibold text-slate-900">{BUSINESS.name}</p>
          <p>{address}</p>
          <p>
            <a href={telHref(BUSINESS.phone)} className="text-blue-600">
              {BUSINESS.phone}
            </a>
          </p>
          <p className="mt-2">Serving {BUSINESS.areasServed.join(" · ")}</p>
        </div>

        {PUBLISHED_LOCATIONS.length > 0 && (
          <nav aria-label="Service areas">
            <p className="font-semibold text-slate-900 mb-1">Service areas</p>
            <ul className="space-y-1">
              {PUBLISHED_LOCATIONS.map((l) => (
                <li key={l.slug}>
                  <Link href={`/${l.slug}`} className="hover:text-blue-600">
                    {l.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
