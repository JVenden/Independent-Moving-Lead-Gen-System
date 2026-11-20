import { NextResponse } from "next/server";
import { z } from "zod";
import { listProspects, updateProspect } from "@/lib/prospects/store";
import { PROSPECT_STATUSES } from "@/lib/prospects/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ prospects: await listProspects() });
  } catch (err) {
    console.error("[prospects]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load" }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PROSPECT_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
  markContacted: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { id, status, notes, markContacted } = parsed.data;
  try {
    const updated = await updateProspect(id, {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(markContacted ? { lastContactedAt: new Date().toISOString() } : {}),
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ prospect: updated });
  } catch (err) {
    console.error("[prospects]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed" }, { status: 500 });
  }
}
