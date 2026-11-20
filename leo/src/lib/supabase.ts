/**
 * Minimal Supabase REST client (no SDK). Server-only: uses the service role key.
 */
function config() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export const hasDb = () => config() !== null;

export async function sb<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {}
): Promise<T> {
  const cfg = config();
  if (!cfg) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
