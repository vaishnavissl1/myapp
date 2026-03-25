-- ================================================================
-- SmartCommute: Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Schedules table
create table if not exists public.schedules (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    source_location text not null,
    source_lat double precision,
    source_lng double precision,
    destination_location text not null,
    dest_lat double precision,
    dest_lng double precision,
    arrival_time timestamptz not null,
    flexibility_minutes integer default 30 check (flexibility_minutes >= 0 and flexibility_minutes <= 120),
    transport_preference text default 'any' check (transport_preference in ('driving','transit','bicycling','walking','any')),
    created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_schedules_user on public.schedules(user_id);
create index if not exists idx_schedules_arrival on public.schedules(arrival_time);

-- ── Row Level Security ─────────────────────────────────────
alter table public.schedules enable row level security;

-- Users can only see their own schedules
create policy "Users select own schedules"
    on public.schedules for select
    using (auth.uid() = user_id);

-- Users can only insert their own schedules
create policy "Users insert own schedules"
    on public.schedules for insert
    with check (auth.uid() = user_id);

-- Users can only delete their own schedules
create policy "Users delete own schedules"
    on public.schedules for delete
    using (auth.uid() = user_id);

-- Users can only update their own schedules
create policy "Users update own schedules"
    on public.schedules for update
    using (auth.uid() = user_id);
