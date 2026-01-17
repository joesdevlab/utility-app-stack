-- ============================================
-- Supabase Schema for Utility App Stack
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- SHARED: User Profiles (linked to Supabase Auth)
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================
-- APPRENTICE-LOG: Log Entries
-- ============================================
create table if not exists apprentice_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  raw_transcript text,
  formatted_entry text not null,
  tasks jsonb default '[]'::jsonb,
  hours numeric(4,2),
  weather text,
  site_name text,
  supervisor text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster queries
create index if not exists apprentice_entries_user_date_idx
  on apprentice_entries(user_id, date desc);

-- RLS for apprentice entries
alter table apprentice_entries enable row level security;

create policy "Users can view own entries"
  on apprentice_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on apprentice_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on apprentice_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on apprentice_entries for delete
  using (auth.uid() = user_id);

-- ============================================
-- BIO-SWAP: Scan History
-- ============================================
create table if not exists bioswap_scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  barcode text not null,
  medicine_name text,
  scanned_price numeric(10,2),
  cheapest_alternative text,
  cheapest_price numeric(10,2),
  savings numeric(10,2),
  created_at timestamptz default now()
);

-- Index for scan history
create index if not exists bioswap_scans_user_idx
  on bioswap_scans(user_id, created_at desc);

-- RLS for scan history
alter table bioswap_scans enable row level security;

create policy "Users can view own scans"
  on bioswap_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on bioswap_scans for insert
  with check (auth.uid() = user_id);

-- ============================================
-- SALVAGE-SCOUT: Material Listings
-- ============================================
create table if not exists salvage_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  condition text not null,
  quantity text,
  image_url text,
  location jsonb not null default '{}'::jsonb,
  contact_method text default 'message',
  status text default 'available',
  posted_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for listing queries
create index if not exists salvage_listings_status_idx
  on salvage_listings(status, posted_at desc);

create index if not exists salvage_listings_location_idx
  on salvage_listings using gin(location);

-- RLS for listings (public read, authenticated write)
alter table salvage_listings enable row level security;

-- Anyone can view available listings
create policy "Anyone can view available listings"
  on salvage_listings for select
  using (status = 'available' or auth.uid() = user_id);

create policy "Users can insert own listings"
  on salvage_listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on salvage_listings for update
  using (auth.uid() = user_id);

create policy "Users can delete own listings"
  on salvage_listings for delete
  using (auth.uid() = user_id);

-- ============================================
-- SALVAGE-SCOUT: Claims/Messages
-- ============================================
create table if not exists salvage_claims (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references salvage_listings on delete cascade not null,
  claimer_id uuid references auth.users on delete cascade not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for claims
create index if not exists salvage_claims_listing_idx
  on salvage_claims(listing_id, created_at desc);

-- RLS for claims
alter table salvage_claims enable row level security;

create policy "Listing owners can view claims"
  on salvage_claims for select
  using (
    auth.uid() = claimer_id or
    auth.uid() in (select user_id from salvage_listings where id = listing_id)
  );

create policy "Users can insert own claims"
  on salvage_claims for insert
  with check (auth.uid() = claimer_id);

create policy "Users can update own claims"
  on salvage_claims for update
  using (auth.uid() = claimer_id);

-- ============================================
-- Storage Buckets for Images
-- ============================================
-- Run these separately in Storage settings or via SQL:

insert into storage.buckets (id, name, public)
values ('salvage-images', 'salvage-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view salvage images"
  on storage.objects for select
  using (bucket_id = 'salvage-images');

create policy "Authenticated users can upload salvage images"
  on storage.objects for insert
  with check (bucket_id = 'salvage-images' and auth.role() = 'authenticated');

create policy "Users can update own salvage images"
  on storage.objects for update
  using (bucket_id = 'salvage-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own salvage images"
  on storage.objects for delete
  using (bucket_id = 'salvage-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Done! Tables created:
-- - profiles (shared)
-- - apprentice_entries
-- - bioswap_scans
-- - salvage_listings
-- - salvage_claims
-- ============================================
