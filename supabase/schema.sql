-- Run once in the Supabase SQL editor.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Form data
  service_type text not null check (service_type in ('labor_only', 'full_service')),
  labor_type text check (labor_type in ('load', 'unload', 'both')),  -- labor_only jobs
  from_zip text not null,
  to_zip text,                     -- null for single-address labor jobs
  home_size text not null,
  stairs text not null default 'none',
  packing text not null default 'none',
  heavy_items text[] not null default '{}',
  move_date date,
  full_name text not null,
  phone text not null,             -- 10 digits, normalized by the API
  email text,

  -- Calculated at submit time
  distance_miles numeric,
  distance_band text,
  quote_min integer,
  quote_max integer,
  needs_review boolean not null default false,  -- unknown ZIP, long distance, odd items

  -- Status & ops
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'lost', 'no_show')),
  notes text,
  source text default 'website',   -- "how did you hear about us"
  assigned_to text,
  final_price integer,             -- what the job actually billed (for tuning the quote formula)

  -- Consent (TCPA): must default to false; only true if they ticked the box
  sms_consent boolean not null default false
);

create index leads_status_idx on public.leads (status);
create index leads_move_date_idx on public.leads (move_date);
create index leads_created_at_idx on public.leads (created_at desc);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.update_updated_at();

-- RLS on with NO policies = the public anon key can't read or write leads.
-- The API route uses the service role key (server-side only), which bypasses RLS.
alter table public.leads enable row level security;
