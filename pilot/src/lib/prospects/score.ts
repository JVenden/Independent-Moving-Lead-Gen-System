import type { Audit } from "./types";

/**
 * Opportunity score, 0–100. Higher = better prospect for you:
 * a weak web presence (easy win to pitch) + an established business (can pay).
 * Findings are written in plain English so they can go straight into outreach.
 */
export function scoreProspect(
  audit: Audit,
  hasWebsite: boolean,
  rating: number | null,
  reviewCount: number
): { score: number; findings: string[] } {
  let score = 0;
  const findings: string[] = [];
  const add = (pts: number, finding: string) => {
    score += pts;
    findings.push(finding);
  };

  if (!hasWebsite) {
    add(45, "No website listed on Google. Customers who search can't learn about you or request a quote");
  } else if (audit.socialOnly) {
    add(40, "Google points customers to a social media page instead of a real website");
  } else if (!audit.reachable) {
    add(40, `Website didn't load when we checked (${audit.error ?? "error"})`);
  } else if (audit.blocked) {
    // Site is up but refused our automated check: don't guess. Review it by hand.
  } else {
    if (!audit.mobileFriendly) add(15, "Site isn't built for phones, where most local searches happen");
    if (!audit.https) add(12, "Site isn't secure (no HTTPS); browsers show a 'Not secure' warning");
    if (audit.loadMs !== null && audit.loadMs > 3000) add(10, `Site took ${(audit.loadMs / 1000).toFixed(1)}s to load; many visitors leave after 3s`);
    if (!audit.hasForm) add(10, "No quote or contact form, so after-hours visitors can't reach you");
    if (!audit.hasClickToCall) add(5, "No tap-to-call button for mobile visitors");
    const age = audit.copyrightYear ? new Date().getFullYear() - audit.copyrightYear : 0;
    if (age >= 3) add(8, `Site looks outdated (copyright ${audit.copyrightYear})`);
  }

  // Can they pay? Established businesses with reviews are better prospects.
  if (reviewCount >= 25) score += 12;
  else if (reviewCount >= 10) score += 8;
  else if (reviewCount < 5) add(5, `Only ${reviewCount} Google review${reviewCount === 1 ? "" : "s"}; a review system would help you win the Maps listings`);
  if (rating !== null && rating >= 4.5 && reviewCount >= 10) score += 3; // great reputation, weak site: strongest pitch

  return { score: Math.min(100, score), findings };
}
