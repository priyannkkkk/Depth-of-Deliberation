-- ============================================================
-- DEPTHS OF DELIBERATION
-- Migration 003 - Reading Progress Upgrade
-- ============================================================

-- ============================================================
-- 1. Add last_read_at
-- ============================================================

alter table public.reading_progress
add column if not exists last_read_at timestamptz not null default now();

-- ============================================================
-- 2. Update existing records
-- ============================================================

update public.reading_progress
set last_read_at = updated_at
where last_read_at is null;

-- ============================================================
-- 3. Index for Continue Reading
-- ============================================================

create index if not exists reading_progress_last_read_idx
on public.reading_progress(user_id, last_read_at desc);
