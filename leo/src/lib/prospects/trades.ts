/**
 * Trades you can search for, plus the content used to build each
 * prospect's personalized preview site. Add a trade = add an entry.
 * `color` is a hex value (applied inline, so any color works).
 */
export type Trade = {
  key: string;
  label: string; // shown in the dashboard
  query: string; // what we search Google Maps for
  color: string;
  headline: (city: string) => string;
  services: string[];
  quoteFields: string[]; // what their instant-quote form would ask
};

export const TRADES: Trade[] = [
  {
    key: "movers",
    label: "Movers",
    query: "moving company",
    color: "#2563eb",
    headline: (c) => `Stress-free local moves in ${c}`,
    services: ["Local moves", "Loading & unloading help", "Packing services", "Apartment moves"],
    quoteFields: ["Home size", "Moving from / to ZIP", "Move date"],
  },
  {
    key: "roofers",
    label: "Roofers",
    query: "roofing contractor",
    color: "#b91c1c",
    headline: (c) => `${c}'s trusted roof repair & replacement`,
    services: ["Roof replacement", "Storm & hail damage", "Leak repair", "Free inspections"],
    quoteFields: ["Roof type", "Approx. size", "Damage or replacement?"],
  },
  {
    key: "plumbers",
    label: "Plumbers",
    query: "plumber",
    color: "#0369a1",
    headline: (c) => `Fast, honest plumbing in ${c}`,
    services: ["Emergency repairs", "Water heaters", "Drain cleaning", "Remodels"],
    quoteFields: ["Problem type", "Urgency", "ZIP code"],
  },
  {
    key: "hvac",
    label: "HVAC",
    query: "HVAC contractor",
    color: "#ea580c",
    headline: (c) => `Heating & cooling you can count on in ${c}`,
    services: ["Furnace repair", "AC installation", "Maintenance plans", "Duct cleaning"],
    quoteFields: ["System type", "Repair or replace?", "ZIP code"],
  },
  {
    key: "landscapers",
    label: "Landscapers",
    query: "landscaping company",
    color: "#15803d",
    headline: (c) => `Beautiful, low-stress yards in ${c}`,
    services: ["Lawn care", "Landscape design", "Snow removal", "Cleanups"],
    quoteFields: ["Lot size", "Services wanted", "How often?"],
  },
  {
    key: "cleaners",
    label: "Cleaning",
    query: "house cleaning service",
    color: "#0d9488",
    headline: (c) => `Spotless homes, happy weekends in ${c}`,
    services: ["Recurring cleaning", "Deep cleaning", "Move-out cleaning", "Office cleaning"],
    quoteFields: ["Bedrooms / bathrooms", "How often?", "Start date"],
  },
  {
    key: "electricians",
    label: "Electricians",
    query: "electrician",
    color: "#ca8a04",
    headline: (c) => `Licensed, on-time electricians in ${c}`,
    services: ["Panel upgrades", "Lighting & fixtures", "EV chargers", "Troubleshooting"],
    quoteFields: ["Job type", "Urgency", "ZIP code"],
  },
  {
    key: "auto",
    label: "Auto repair",
    query: "auto repair shop",
    color: "#475569",
    headline: (c) => `Honest auto repair in ${c}`,
    services: ["Diagnostics", "Brakes", "Oil & maintenance", "Tires"],
    quoteFields: ["Vehicle", "Problem", "Preferred day"],
  },
  {
    key: "painters",
    label: "Painters",
    query: "house painter",
    color: "#7c3aed",
    headline: (c) => `Clean, careful painting in ${c}`,
    services: ["Interior painting", "Exterior painting", "Cabinets", "Decks & staining"],
    quoteFields: ["Interior or exterior?", "Rooms / sq ft", "Start date"],
  },
];

export const tradeByKey = (key: string) => TRADES.find((t) => t.key === key) ?? TRADES[0];
