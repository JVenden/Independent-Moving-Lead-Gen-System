import { hasDb, sb } from "@/lib/supabase";
import { isDemo } from "@/lib/brand";
import { DEMO_PROSPECTS } from "./demo";
import type { FoundProspect, Prospect, ProspectStatus } from "./types";

/**
 * Prospect storage. Uses Supabase when configured; otherwise an in-memory
 * store (local dev and demo mode only: it resets when the server restarts).
 */

type Row = {
  id: string;
  created_at: string;
  place_id: string;
  name: string;
  trade: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  maps_url: string;
  rating: number | null;
  review_count: number;
  audit: FoundProspect["audit"];
  findings: string[];
  score: number;
  status: ProspectStatus;
  notes: string | null;
  preview_slug: string;
  preview_views: number;
  last_viewed_at: string | null;
  last_contacted_at: string | null;
};

const fromRow = (r: Row): Prospect => ({
  id: r.id,
  createdAt: r.created_at,
  placeId: r.place_id,
  name: r.name,
  trade: r.trade,
  city: r.city,
  address: r.address,
  phone: r.phone,
  website: r.website,
  mapsUrl: r.maps_url,
  rating: r.rating,
  reviewCount: r.review_count,
  audit: r.audit,
  findings: r.findings,
  score: r.score,
  status: r.status,
  notes: r.notes ?? "",
  previewSlug: r.preview_slug,
  previewViews: r.preview_views,
  lastViewedAt: r.last_viewed_at,
  lastContactedAt: r.last_contacted_at,
});

// ---- in-memory fallback ----
const g = globalThis as unknown as { __prospects?: Map<string, Prospect> };
function mem() {
  if (!g.__prospects) {
    g.__prospects = new Map();
    if (isDemo()) DEMO_PROSPECTS.forEach((p) => insertMem(p));
  }
  return g.__prospects;
}
function insertMem(p: FoundProspect): Prospect {
  const store = g.__prospects!;
  const existing = Array.from(store.values()).find((x) => x.placeId === p.placeId);
  const merged: Prospect = existing
    ? { ...existing, ...p }
    : {
        ...p,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: "new",
        notes: "",
        previewSlug: p.placeId.startsWith("demo-") ? p.placeId : crypto.randomUUID().slice(0, 10),
        previewViews: 0,
        lastViewedAt: null,
        lastContactedAt: null,
      };
  store.set(merged.id, merged);
  return merged;
}

function inMemory() {
  if (hasDb() && !isDemo()) return false;
  if (process.env.NODE_ENV === "production" && !isDemo()) {
    throw new Error("Supabase is not configured");
  }
  return true;
}

export async function listProspects(): Promise<Prospect[]> {
  if (inMemory()) return Array.from(mem().values()).sort((a, b) => b.score - a.score);
  const rows = await sb<Row[]>("prospects?select=*&order=score.desc,created_at.desc&limit=1000");
  return rows.map(fromRow);
}

/** Insert new prospects; refresh audit data on ones already saved (keeps status, notes, preview link). */
export async function saveProspects(found: FoundProspect[]): Promise<Prospect[]> {
  if (found.length === 0) return [];
  if (inMemory()) {
    mem();
    return found.map(insertMem);
  }
  const rows = await sb<Row[]>("prospects?on_conflict=place_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: found.map((p) => ({
      place_id: p.placeId,
      name: p.name,
      trade: p.trade,
      city: p.city,
      address: p.address,
      phone: p.phone,
      website: p.website,
      maps_url: p.mapsUrl,
      rating: p.rating,
      review_count: p.reviewCount,
      audit: p.audit,
      findings: p.findings,
      score: p.score,
    })),
  });
  return rows.map(fromRow);
}

export async function updateProspect(
  id: string,
  patch: Partial<Pick<Prospect, "status" | "notes" | "lastContactedAt">>
): Promise<Prospect | null> {
  if (inMemory()) {
    const p = mem().get(id);
    if (!p) return null;
    const next = { ...p, ...patch };
    mem().set(id, next);
    return next;
  }
  const body: Record<string, unknown> = {};
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.notes !== undefined) body.notes = patch.notes;
  if (patch.lastContactedAt !== undefined) body.last_contacted_at = patch.lastContactedAt;
  const rows = await sb<Row[]>(`prospects?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    prefer: "return=representation",
    body,
  });
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function getProspectBySlug(slug: string): Promise<Prospect | null> {
  if (inMemory()) return Array.from(mem().values()).find((p) => p.previewSlug === slug) ?? null;
  const rows = await sb<Row[]>(`prospects?preview_slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function recordPreviewView(p: Prospect): Promise<void> {
  const now = new Date().toISOString();
  if (inMemory()) {
    mem().set(p.id, { ...p, previewViews: p.previewViews + 1, lastViewedAt: now });
    return;
  }
  await sb(`prospects?id=eq.${encodeURIComponent(p.id)}`, {
    method: "PATCH",
    body: { preview_views: p.previewViews + 1, last_viewed_at: now },
  });
}
