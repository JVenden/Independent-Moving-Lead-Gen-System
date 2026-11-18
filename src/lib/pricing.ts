import type { LeadFormValues } from "./schema";
import { needsDestination } from "./schema";
import { ZIP_COORDS } from "./zips";

// ⚠️ Every number in this file is a placeholder. Tune to the owner's real rates.

type Band = "local" | "short" | "medium" | "long";

// Base prices by homeSize × distanceBand × serviceType
const PRICE_MATRIX: Record<LeadFormValues["homeSize"], Record<Band, { labor: number; full: number }>> = {
  studio_1bed: {
    local: { labor: 280, full: 450 },
    short: { labor: 320, full: 520 },
    medium: { labor: 380, full: 650 },
    long: { labor: 450, full: 800 },
  },
  "2bed": {
    local: { labor: 380, full: 620 },
    short: { labor: 450, full: 720 },
    medium: { labor: 550, full: 900 },
    long: { labor: 650, full: 1100 },
  },
  "3bed": {
    local: { labor: 520, full: 850 },
    short: { labor: 620, full: 1000 },
    medium: { labor: 750, full: 1250 },
    long: { labor: 900, full: 1550 },
  },
  "4plus_bed": {
    local: { labor: 750, full: 1200 },
    short: { labor: 900, full: 1450 },
    medium: { labor: 1100, full: 1800 },
    long: { labor: 1350, full: 2200 },
  },
};

const STAIRS_MODIFIER: Record<LeadFormValues["stairs"], number> = {
  none: 0,
  elevator: 0.05,
  "1flight": 0.1,
  "2plus": 0.2,
};

const PACKING_MODIFIER: Record<LeadFormValues["packing"], number> = {
  none: 0,
  partial: 0.15,
  full: 0.3,
};

/** Labor-only at one end (just load OR just unload) is roughly 60% of the work. */
const SINGLE_END_LABOR_FACTOR = 0.6;

const HEAVY_ITEM_FEE: Record<LeadFormValues["heavyItems"][number], number> = {
  piano: 150,
  safe: 125,
  pool_table: 200,
  hot_tub: 300,
  other: 75,
};

/** Moves beyond this distance get flagged for manual review. */
const MAX_AUTO_QUOTE_MILES = 75;

function haversineMiles([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceBand(miles: number): Band {
  if (miles < 10) return "local";
  if (miles < 25) return "short";
  if (miles < 50) return "medium";
  return "long";
}

export type Quote = {
  min: number;
  max: number;
  miles: number | null; // null = single-address job or unknown ZIP
  band: Band;
  needsReview: boolean; // true = owner should double-check before confirming
};

export function calculateQuote(data: LeadFormValues): Quote {
  let miles: number | null = null;
  let band: Band = "local";
  let needsReview = false;

  if (needsDestination(data)) {
    const from = ZIP_COORDS[data.fromZip];
    const to = data.toZip ? ZIP_COORDS[data.toZip] : undefined;
    if (from && to) {
      miles = haversineMiles(from, to);
      band = distanceBand(miles);
      if (miles > MAX_AUTO_QUOTE_MILES) needsReview = true;
    } else {
      band = "short"; // unknown ZIP: middle-of-the-road guess
      needsReview = true;
    }
  } else if (!ZIP_COORDS[data.fromZip]) {
    needsReview = true; // job location outside the known service area
  }

  const tier = data.serviceType === "full_service" ? "full" : "labor";
  let base = PRICE_MATRIX[data.homeSize][band][tier];
  if (data.serviceType === "labor_only" && data.laborType !== "both") {
    base *= SINGLE_END_LABOR_FACTOR;
  }

  const modifier = 1 + STAIRS_MODIFIER[data.stairs] + PACKING_MODIFIER[data.packing];
  const flatFees = data.heavyItems.reduce((sum, item) => sum + HEAVY_ITEM_FEE[item], 0);
  if (data.heavyItems.includes("other")) needsReview = true;

  const mid = base * modifier + flatFees;
  const roundTo5 = (n: number) => Math.round(n / 5) * 5;

  return {
    min: roundTo5(mid * 0.9),
    max: roundTo5(mid * 1.15),
    miles: miles === null ? null : Math.round(miles),
    band,
    needsReview,
  };
}
