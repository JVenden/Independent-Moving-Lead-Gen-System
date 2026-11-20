import type { Metadata } from "next";
import "./globals.css";
import { BRAND, isDemo } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: `${BRAND.agencyName} | Websites That Text You New Leads`,
  description: `Websites, instant-quote funnels and local SEO for small businesses in ${BRAND.city}, ${BRAND.region}. Get a ballpark estimate in 60 seconds.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {isDemo() && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            <strong>Demo mode:</strong> sample data, placeholder prices; nothing is saved or sent.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
