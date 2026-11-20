import type { Audit } from "./types";

const SOCIAL_HOSTS = ["facebook.com", "instagram.com", "yelp.com", "nextdoor.com", "linktr.ee", "business.site"];
const BUILDERS: [RegExp, string][] = [
  [/wix\.com|wixstatic/i, "Wix"],
  [/squarespace/i, "Squarespace"],
  [/godaddy|secureserver\.net|img1\.wsimg\.com/i, "GoDaddy builder"],
  [/weebly/i, "Weebly"],
  [/wp-content|wordpress/i, "WordPress"],
];

const emptyAudit = (over: Partial<Audit> = {}): Audit => ({
  checked: false,
  reachable: false,
  blocked: false,
  https: false,
  mobileFriendly: false,
  loadMs: null,
  hasForm: false,
  hasClickToCall: false,
  copyrightYear: null,
  builder: null,
  socialOnly: false,
  error: null,
  ...over,
});

/**
 * Quick, free website check: one HTTP request, then look at the HTML.
 * Not a full Lighthouse audit, just enough to find a sales angle.
 */
export async function auditWebsite(rawUrl: string, timeoutMs = 7000): Promise<Audit> {
  if (!rawUrl) return emptyAudit({ checked: true, error: "No website" });

  let url: URL;
  try {
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return emptyAudit({ checked: true, error: "Invalid URL" });
  }

  const host = url.hostname.replace(/^www\./, "");
  if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return emptyAudit({ checked: true, reachable: true, https: true, socialOnly: true });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteCheck/1.0)", Accept: "text/html" },
      cache: "no-store",
    });
    const html = (await res.text()).slice(0, 1_500_000);
    const loadMs = Date.now() - started;
    if ([401, 403, 406, 429, 503].includes(res.status)) {
      // Bot protection (Cloudflare etc.): the site is up, we just can't inspect it.
      return emptyAudit({ checked: true, reachable: true, blocked: true, loadMs, error: `Check blocked (HTTP ${res.status})` });
    }
    if (!res.ok) return emptyAudit({ checked: true, loadMs, error: `HTTP ${res.status}` });

    const years = Array.from(html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi))
      .map((m) => Number(m[1]))
      .filter((y) => y > 1995 && y <= new Date().getFullYear() + 1);

    return {
      checked: true,
      reachable: true,
      blocked: false,
      https: new URL(res.url || url.href).protocol === "https:",
      mobileFriendly: /<meta[^>]+name=["']?viewport/i.test(html),
      loadMs,
      hasForm: /<form[\s>]/i.test(html) || /calendly|typeform|jotform|housecallpro|jobber/i.test(html),
      hasClickToCall: /href=["']tel:/i.test(html),
      copyrightYear: years.length ? Math.max(...years) : null,
      builder: BUILDERS.find(([re]) => re.test(html))?.[1] ?? null,
      socialOnly: false,
      error: null,
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return emptyAudit({ checked: true, error: aborted ? "Timed out" : "Could not load" });
  } finally {
    clearTimeout(timer);
  }
}
