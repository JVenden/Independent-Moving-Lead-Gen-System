import type { Metadata } from "next";
import "./globals.css";
import { BUSINESS } from "@/lib/business";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemoBanner } from "@/components/site/DemoBanner";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: `${BUSINESS.name} | Local Movers with Instant Quotes`,
  description: `Local labor-only and full-service movers serving ${BUSINESS.areasServed.join(", ")}. Get an instant estimate and lock in your date.`,
};

/** schema.org LocalBusiness data: helps Google connect the site to the GBP listing. */
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: BUSINESS.name,
  url: BUSINESS.siteUrl,
  telephone: BUSINESS.phone,
  ...(BUSINESS.email ? { email: BUSINESS.email } : {}),
  address: {
    "@type": "PostalAddress",
    ...(BUSINESS.streetAddress ? { streetAddress: BUSINESS.streetAddress } : {}),
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: "US",
  },
  areaServed: BUSINESS.areasServed.map((name) => ({ "@type": "City", name })),
  openingHours: BUSINESS.hours,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <DemoBanner />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </body>
    </html>
  );
}
