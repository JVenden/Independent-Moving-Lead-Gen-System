import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND, formatPhone, telHref } from "@/lib/brand";
import { getProspectBySlug, recordPreviewView } from "@/lib/prospects/store";
import { tradeByKey } from "@/lib/prospects/trades";
import { sendAlert } from "@/lib/notify";

/**
 * The personalized "here's what your site could look like" preview
 * that outreach links to. Opening it pings you (a buying signal).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

const ALERT_COOLDOWN_MS = 60 * 60 * 1000;

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { internal?: string };
}) {
  const p = await getProspectBySlug(params.slug).catch(() => null);
  if (!p) notFound();

  // Count the view and ping you, unless it's you opening it from the dashboard.
  if (searchParams.internal !== "1") {
    const quiet = p.lastViewedAt && Date.now() - new Date(p.lastViewedAt).getTime() < ALERT_COOLDOWN_MS;
    await recordPreviewView(p).catch((e) => console.error("[preview] view", e));
    if (!quiet) {
      await sendAlert(
        `${p.name} opened their preview`,
        `👀 ${p.name} just opened their preview (view #${p.previewViews + 1}).\nGood time to call: ${formatPhone(p.phone)}`
      ).catch(() => {});
    }
  }

  const trade = tradeByKey(p.trade);
  const town = p.city.split(",")[0];
  const claimUrl = `/?ref=${encodeURIComponent(p.previewSlug)}&business=${encodeURIComponent(p.name)}#estimate`;
  const c = trade.color;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-3 bg-slate-900 px-4 py-2 text-center text-sm text-white">
        <span>
          Free preview made for <strong>{p.name}</strong> by {BRAND.agencyName}
        </span>
        <a href={claimUrl} className="rounded-md bg-emerald-500 px-3 py-1 font-semibold text-white hover:bg-emerald-600">
          Make this my website →
        </a>
      </div>

      {/* Mock site */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="text-xl font-extrabold" style={{ color: c }}>{p.name}</span>
        {p.phone && (
          <a href={telHref(p.phone)} className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: c }}>
            Call {formatPhone(p.phone)}
          </a>
        )}
      </header>

      <section className="px-4 py-14 text-white" style={{ background: c }}>
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
          <div>
            {p.rating !== null && p.reviewCount > 0 && (
              <p className="mb-3 text-sm font-semibold opacity-90">
                ★ {p.rating.toFixed(1)} from {p.reviewCount} Google reviews
              </p>
            )}
            <h1 className="text-4xl font-extrabold leading-tight">{trade.headline(town)}</h1>
            <p className="mt-4 text-lg opacity-90">
              Get an instant price online in under a minute. We text you back fast.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-slate-800 shadow-xl">
            <p className="font-bold">Get your instant quote</p>
            <div className="mt-4 space-y-3">
              {trade.quoteFields.map((f) => (
                <div key={f}>
                  <p className="mb-1 text-xs font-medium text-slate-500">{f}</p>
                  <div className="h-10 rounded-lg border border-slate-200 bg-slate-50" />
                </div>
              ))}
              <div className="rounded-lg py-3 text-center font-semibold text-white" style={{ background: c }}>
                See my price
              </div>
              <p className="text-center text-xs text-slate-500">Preview only: the live version texts you every request.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-2xl font-bold">What we do</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {trade.services.map((s) => (
            <div key={s} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 h-1.5 w-8 rounded" style={{ background: c }} />
              <p className="font-semibold">{s}</p>
              <p className="mt-1 text-sm text-slate-500">Serving {town} and nearby.</p>
            </div>
          ))}
        </div>
      </section>

      {p.findings.length > 0 && (
        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold">What this would fix for {p.name}</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {p.findings.map((f) => (
                <li key={f}>⚠️ {f}</li>
              ))}
            </ul>
            <a
              href={claimUrl}
              className="mt-8 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Get pricing for this site
            </a>
            <p className="mt-3 text-sm text-slate-500">
              Questions? Call {BRAND.ownerFirstName} at <a href={telHref(BRAND.phone)} className="underline">{BRAND.phone}</a>.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
