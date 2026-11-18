import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/business";
import { PUBLISHED_LOCATIONS } from "@/content/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BUSINESS.siteUrl, changeFrequency: "monthly", priority: 1 },
    ...PUBLISHED_LOCATIONS.map((l) => ({
      url: `${BUSINESS.siteUrl}/${l.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
