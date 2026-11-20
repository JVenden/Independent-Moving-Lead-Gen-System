import { BRAND, telHref } from "@/lib/brand";
import { PACKAGES } from "@/lib/inbound/pricing";
import { FunnelWizard } from "@/components/funnel/FunnelWizard";

export default function Home({ searchParams }: { searchParams: { ref?: string; business?: string } }) {
  const ref = (searchParams.ref ?? "").slice(0, 64);
  const business = (searchParams.business ?? "").slice(0, 120);

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-lg font-bold">{BRAND.agencyName}</span>
        <a href={telHref(BRAND.phone)} className="text-sm font-semibold text-blue-600">{BRAND.phone}</a>
      </header>

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 pb-16 pt-6 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            For local service businesses in {BRAND.city}, {BRAND.region}
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Stop paying for shared leads. Get your own, texted to your phone.
          </h1>
          <p className="text-lg text-slate-600">
            We build fast websites with an instant-quote form. Customers see a price in seconds, and you get a
            text with their details before your competitors even call back.
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>✓ Exclusive leads: not sold to 5 other companies like Angi or Thumbtack</li>
            <li>✓ Built to rank on Google &amp; Maps in your service area</li>
            <li>✓ One-tap review link to grow your Google rating</li>
            <li>✓ Live in about 2 weeks</li>
          </ul>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Recent project</p>
            <p className="mt-1 font-semibold">{BRAND.caseStudy.client}</p>
            <p className="text-sm text-slate-600">{BRAND.caseStudy.summary}</p>
            {BRAND.caseStudy.result && <p className="mt-2 text-sm font-semibold text-emerald-700">{BRAND.caseStudy.result}</p>}
            {BRAND.caseStudy.url && (
              <a href={BRAND.caseStudy.url} className="mt-2 inline-block text-sm font-semibold text-blue-600 underline">
                See it live →
              </a>
            )}
          </div>
        </div>
        <div id="estimate">
          <FunnelWizard refSlug={ref} businessName={business} />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
          <p className="mt-2 text-center text-slate-600">One-time setup, then a small monthly fee for hosting, lead alerts, updates and support.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.values(PACKAGES).map((p) => (
              <div key={p.label} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold">{p.label}</h3>
                <p className="mt-2 text-2xl font-extrabold">from ${p.setup[0].toLocaleString()}</p>
                <p className="text-sm text-slate-500">+ ${p.monthly}/mo</p>
                <ul className="mt-4 space-y-1 text-sm text-slate-700">
                  {p.includes.map((i) => <li key={i}>✓ {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#estimate" className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Get my estimate
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {BRAND.agencyName} · {BRAND.city}, {BRAND.region} ·{" "}
        <a href={telHref(BRAND.phone)}>{BRAND.phone}</a>
      </footer>
    </main>
  );
}
