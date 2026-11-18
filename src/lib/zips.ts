/**
 * ZIP → approximate [lat, lng] for the service area.
 *
 * Unknown ZIPs still get a quote (using the "short" distance band) but the lead
 * is flagged needs_review so the owner double-checks the price.
 *
 * TODO: replace these examples with the 20–50 ZIPs he actually serves.
 * Free source for ZIP centroids: https://simplemaps.com/data/us-zips
 */
export const ZIP_COORDS: Record<string, [number, number]> = {
  "53925": [43.07, -89.4], // example — verify
  "53538": [43.0, -89.5], // example — verify
};
