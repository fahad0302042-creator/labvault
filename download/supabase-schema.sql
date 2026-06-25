-- ============================================================
-- LabVault — Supabase Schema
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

-- ---------- Chemicals ----------
create table if not exists public.chemicals (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  formula          text,
  quantity         numeric not null default 0,
  initial_quantity numeric not null default 0,
  unit             text not null default 'g',
  notes            text,
  qr_code          text unique not null default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id)
);

-- ---------- Apparatus ----------
-- Note: apparatus does NOT have QR codes — only chemicals do.
create table if not exists public.apparatus (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null default 'other',
  quantity         integer not null default 0,
  initial_quantity integer not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id)
);

-- ---------- Consumption logs ----------
create table if not exists public.consumption_logs (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null,
  item_type       text not null check (item_type in ('chemical','apparatus')),
  item_name       text not null,
  action          text not null check (action in ('consumed','restocked','broken','created','updated','deleted')),
  quantity        numeric not null default 0,
  unit            text,
  note            text,
  logged_by       uuid references auth.users(id),
  logged_by_name  text,
  logged_at       timestamptz not null default now()
);

create index if not exists idx_logs_item_id on public.consumption_logs(item_id);
create index if not exists idx_logs_logged_at on public.consumption_logs(logged_at desc);

-- ---------- Enable Row Level Security ----------
alter table public.chemicals         enable row level security;
alter table public.apparatus         enable row level security;
alter table public.consumption_logs  enable row level security;

-- ---------- RLS Policies ----------
-- For the prototype: any authenticated user can read/write all rows.
-- Tighten this later if you need per-team isolation.

-- Chemicals
create policy "Chemicals: read for authenticated" on public.chemicals
  for select to authenticated using (true);
create policy "Chemicals: write for authenticated" on public.chemicals
  for all to authenticated using (true) with check (true);

-- Apparatus
create policy "Apparatus: read for authenticated" on public.apparatus
  for select to authenticated using (true);
create policy "Apparatus: write for authenticated" on public.apparatus
  for all to authenticated using (true) with check (true);

-- Logs
create policy "Logs: read for authenticated" on public.consumption_logs
  for select to authenticated using (true);
create policy "Logs: write for authenticated" on public.consumption_logs
  for all to authenticated using (true) with check (true);

-- ---------- Realtime (optional but nice) ----------
alter publication supabase_realtime add table public.chemicals;
alter publication supabase_realtime add table public.apparatus;
alter publication supabase_realtime add table public.consumption_logs;
