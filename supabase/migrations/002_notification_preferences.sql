-- ============================================================
-- DEPTHS OF DELIBERATION
-- Migration 002 - Reader Notifications
-- ============================================================

-- ============================================================
-- 1. Notification Preferences
-- ============================================================

create table if not exists public.notification_preferences (
    user_id uuid primary key
        references public.profiles(id)
        on delete cascade,

    new_story_email boolean not null default true,
    newsletter boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. Enable Row Level Security
-- ============================================================

alter table public.notification_preferences
enable row level security;

-- ============================================================
-- 3. Policies
-- ============================================================

create policy "Users can read own notification preferences"
on public.notification_preferences
for select
using (auth.uid() = user_id);

create policy "Users can create own notification preferences"
on public.notification_preferences
for insert
with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
on public.notification_preferences
for update
using (auth.uid() = user_id);

-- ============================================================
-- 4. Auto Update Timestamp
-- ============================================================

create trigger set_updated_at_notification_preferences
before update on public.notification_preferences
for each row
execute function public.set_updated_at();

-- ============================================================
-- 5. Auto Create Preferences For New Users
-- ============================================================

create or replace function public.create_notification_preferences()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.notification_preferences (
        user_id,
        new_story_email,
        newsletter
    )
    values (
        new.id,
        true,
        true
    )
    on conflict (user_id) do nothing;

    return new;
end;
$$;

create trigger create_notification_preferences_trigger
after insert on public.profiles
for each row
execute function public.create_notification_preferences();