"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Prospect, ProspectStatus } from "@/lib/prospects/types";
import { PROSPECT_STATUSES } from "@/lib/prospects/types";
import { callScript, coldEmail, followUpText } from "@/lib/prospects/outreach";
import { telHref } from "@/lib/brand";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<ProspectStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  call_booked: "Call booked",
  won: "Won 🎉",
  lost: "Lost",
  not_a_fit: "Not a fit",
};

function scoreColor(s: number) {
  if (s >= 60) return "bg-emerald-100 text-emerald-800";
  if (s >= 35) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

export function Dashboard({ trades }: { trades: { key: string; label: string }[] }) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [trade, setTrade] = useState(trades[0]?.key ?? "");
  const [city, setCity] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ProspectStatus>("all");
  const [minScore, setMinScore] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/prospects", { cache: "no-store" });
    const body = await res.json().catch(() => null);
    if (res.ok) setProspects(body.prospects);
    else setMessage(body?.error ?? "Couldn't load prospects");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade, city }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Search failed");
      setMessage(body.demo ? `Demo mode: loaded ${body.found} sample prospects.` : `Found and audited ${body.found} businesses.`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const patch = async (id: string, update: { status?: ProspectStatus; notes?: string; markContacted?: boolean }) => {
    const res = await fetch("/api/admin/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...update }),
    });
    const body = await res.json().catch(() => null);
    if (res.ok) setProspects((list) => list.map((p) => (p.id === id ? body.prospect : p)));
    else setMessage(body?.error ?? "Update failed");
  };

  const shown = useMemo(
    () => prospects.filter((p) => (statusFilter === "all" || p.status === statusFilter) && p.score >= minScore),
    [prospects, statusFilter, minScore]
  );

  const stats = useMemo(() => {
    const count = (s: ProspectStatus) => prospects.filter((p) => p.status === s).length;
    return [
      ["Prospects", prospects.length],
      ["Hot (60+)", prospects.filter((p) => p.score >= 60).length],
      ["Contacted", count("contacted")],
      ["Opened preview", prospects.filter((p) => p.previewViews > 0).length],
      ["Replied", count("replied") + count("call_booked")],
      ["Won", count("won")],
    ] as const;
  }, [prospects]);

  return (
    <div className="space-y-6">
      {/* Find */}
      <form onSubmit={search} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Trade</span>
          <select value={trade} onChange={(e) => setTrade(e.target.value)} className="rounded-lg border border-slate-300 p-2.5">
            {trades.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="min-w-[200px] flex-1 text-sm">
          <span className="mb-1 block font-medium text-slate-700">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Columbus, WI"
            required
            minLength={2}
            className="w-full rounded-lg border border-slate-300 p-2.5"
          />
        </label>
        <Button type="submit" disabled={searching} className="bg-blue-600 text-white hover:bg-blue-700">
          {searching ? "Searching & auditing…" : "Find prospects"}
        </Button>
        {message && <p className="w-full text-sm text-slate-600">{message}</p>}
      </form>

      {/* Pipeline stats */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold">{n}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-slate-300 p-2">
          <option value="all">All statuses</option>
          {PROSPECT_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="rounded-lg border border-slate-300 p-2">
          <option value={0}>Any score</option>
          <option value={35}>Score 35+</option>
          <option value={60}>Score 60+ (hot)</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {shown.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No prospects yet. Pick a trade and city above to find some.
          </p>
        )}
        {shown.map((p) => (
          <ProspectCard
            key={p.id}
            p={p}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
            onPatch={(u) => patch(p.id, u)}
          />
        ))}
      </div>
    </div>
  );
}

function ProspectCard({
  p,
  open,
  onToggle,
  onPatch,
}: {
  p: Prospect;
  open: boolean;
  onToggle: () => void;
  onPatch: (u: { status?: ProspectStatus; notes?: string; markContacted?: boolean }) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [notes, setNotes] = useState(p.notes);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copy this:", text);
    }
  };

  const email = coldEmail(p);
  const mailto = `mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full flex-wrap items-center gap-3 p-4 text-left">
        <span className={`rounded-lg px-2.5 py-1 text-sm font-bold ${scoreColor(p.score)}`}>{p.score}</span>
        <span className="min-w-[180px] flex-1">
          <span className="block font-semibold">{p.name}</span>
          <span className="block text-xs text-slate-500">
            {p.city} · {p.rating !== null ? `★ ${p.rating} (${p.reviewCount})` : "no reviews"} ·{" "}
            {p.website ? (p.audit.socialOnly ? "social page only" : p.audit.builder ?? "has site") : "no website"}
          </span>
        </span>
        {p.previewViews > 0 && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
            👀 viewed {p.previewViews}×
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{STATUS_LABEL[p.status]}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 p-4 text-sm">
          {p.findings.length > 0 ? (
            <ul className="space-y-1 text-slate-700">
              {p.findings.map((f) => <li key={f}>⚠️ {f}</li>)}
            </ul>
          ) : (
            <p className="text-slate-500">No obvious website problems. Lower priority, or pitch SEO/reviews instead.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {p.phone && (
              <a href={telHref(p.phone)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold hover:bg-slate-50">
                📞 {p.phone}
              </a>
            )}
            {p.website && (
              <a href={p.website} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">
                Their site ↗
              </a>
            )}
            {p.mapsUrl && (
              <a href={p.mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">
                Google Maps ↗
              </a>
            )}
            <a
              href={`/p/${p.previewSlug}?internal=1`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Their preview site ↗
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => copy("script", callScript(p))}>
              {copied === "script" ? "Copied!" : "Copy call script"}
            </Button>
            <Button type="button" variant="outline" onClick={() => copy("email", `Subject: ${email.subject}\n\n${email.body}`)}>
              {copied === "email" ? "Copied!" : "Copy email"}
            </Button>
            <a href={mailto} className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 font-semibold hover:bg-slate-50">
              Open in email app
            </a>
            <Button type="button" variant="outline" onClick={() => copy("text", followUpText(p))} title="Only after they've said yes / given you their cell">
              {copied === "text" ? "Copied!" : "Copy follow-up text"}
            </Button>
            <Button type="button" onClick={() => onPatch({ status: "contacted", markContacted: true })}>
              Mark contacted
            </Button>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <select
              value={p.status}
              onChange={(e) => onPatch({ status: e.target.value as ProspectStatus })}
              className="rounded-lg border border-slate-300 p-2"
            >
              {PROSPECT_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== p.notes && onPatch({ notes })}
              placeholder="Notes (saved when you click away)"
              rows={2}
              className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2"
            />
          </div>
          {p.lastContactedAt && (
            <p className="text-xs text-slate-500">Last contacted {new Date(p.lastContactedAt).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
