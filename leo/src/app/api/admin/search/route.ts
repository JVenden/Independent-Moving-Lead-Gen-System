import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemo } from "@/lib/brand";
import { searchPlaces } from "@/lib/prospects/places";
import { auditWebsite } from "@/lib/prospects/audit";
import { scoreProspect } from "@/lib/prospects/score";
import { saveProspects } from "@/lib/prospects/store";
import { tradeByKey } from "@/lib/prospects/trades";
import { DEMO_PROSPECTS } from "@/lib/prospects/demo";
import type { FoundProspect } from "@/lib/prospects/types";

export const maxDuration = 26; // seconds (Netlify's limit for synchronous functions)

const bodySchema = z.object({
  trade: z.string().min(1).max(40),
  city: z.string().trim().min(2).max(80),
  limit: z.number().int().min(1).max(40).default(20),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick a trade and enter a city." }, { status: 400 });
  const { trade: tradeKey, city, limit } = parsed.data;
  const trade = tradeByKey(tradeKey);

  if (isDemo() || !process.env.GOOGLE_PLACES_API_KEY) {
    if (!isDemo() && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY is not set." }, { status: 503 });
    }
    // Demo / no key in dev: return the sample prospects so the flow can be tried end to end.
    const saved = await saveProspects(DEMO_PROSPECTS);
    return NextResponse.json({ found: saved.length, demo: true, prospects: saved });
  }

  try {
    const places = await searchPlaces(`${trade.query} in ${city}`, limit);
    // Audit every site in parallel; each check has its own timeout.
    const found: FoundProspect[] = await Promise.all(
      places.map(async (pl) => {
        const audit = await auditWebsite(pl.website);
        return {
          ...pl,
          trade: trade.key,
          city,
          audit,
          ...scoreProspect(audit, !!pl.website, pl.rating, pl.reviewCount),
        };
      })
    );
    const saved = await saveProspects(found);
    return NextResponse.json({ found: saved.length, demo: false, prospects: saved });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status: 500 });
  }
}
