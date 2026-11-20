-- Run once in the Supabase SQL editor.

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Businesses found by the prospect finder (outbound pipeline)
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  place_id text not null unique,       -- Google Places id (dedupes repeat searches)
  name text not null,
  trade text not null,
  city text not null,
  address text not null default '',
  phone text not null default '',
  website text not null default '',
  maps_url text not null default '',
  rating numeric,
  review_count integer not null default 0,

  audit jsonb not null default '{}',   -- website check results
  findings text[] not null default '{}',
  score integer not null default 0,    -- 0-100 opportunity score

  status text not null default 'new'
    check (status in ('new', 'contacted', 'replied', 'call_booked', 'won', 'lost', 'not_a_fit')),
  notes text,
  last_contacted_at timestamptz,

  -- Personalized preview page: /p/<preview_slug>
  preview_slug text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  preview_views integer not null default 0,
  last_viewed_at timestamptz
);

create index prospects_score_idx on public.prospects (score desc);
create index prospects_status_idx on public.prospects (status);

create trigger prospects_updated_at before update on public.prospects
  for each row execute function public.update_updated_at();

-- Businesses that filled out your estimate form (inbound pipeline)
create table public.inbound_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  project_type text not null,
  industry text,
  current_website text,
  primary_goal text not null,
  timeline text not null,
  business_name text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  sms_consent boolean not null default false,   -- TCPA: only true if they ticked the box

  setup_min integer,
  setup_max integer,
  monthly integer,
  priority text,                                -- hot / warm / cold

  prospect_id uuid references public.prospects (id) on delete set null,  -- came from your outreach

  status text not null default 'new'
    check (status in ('new', 'contacted', 'call_booked', 'proposal_sent', 'won', 'lost')),
  notes text,
  setup_fee_charged integer,   -- what you actually charged (for tuning prices + valuation)
  monthly_fee_charged integer
);

create index inbound_leads_created_at_idx on public.inbound_leads (created_at desc);

create trigger inbound_leads_updated_at before update on public.inbound_leads
  for each row execute function public.update_updated_at();

-- RLS on with no policies = the public anon key can't touch these tables.
-- The app uses the service role key on the server only.
alter table public.prospects enable row level security;
alter table public.inbound_leads enable row level security;

-- Your monthly recurring revenue (what a buyer will ask for first):
-- select count(*) as clients, sum(monthly_fee_charged) as mrr from inbound_leads where status = 'won';
