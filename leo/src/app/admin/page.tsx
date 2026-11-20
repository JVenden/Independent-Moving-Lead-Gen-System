import { BRAND } from "@/lib/brand";
import { TRADES } from "@/lib/prospects/trades";
import { Dashboard } from "./Dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: `${BRAND.product} Dashboard`, robots: { index: false } };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">{BRAND.product}</h1>
        <p className="text-sm text-slate-500">{BRAND.productTagline}</p>
      </div>
      <Dashboard trades={TRADES.map((t) => ({ key: t.key, label: t.label }))} />
    </main>
  );
}
