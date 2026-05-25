-- ═══════════════════════════════════════════════════════════════
-- DEPTHS OF DELIBERATION — Complete Database Schema
-- Migration: 001_initial_schema.sql
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- ── Enable extensions ────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for full-text search

-- ════════════════════════════════════════════════════════════
-- TABLES
-- ════════════════════════════════════════════════════════════

-- ── 1. Profiles (extends Supabase auth.users) ────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,
  bio           text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 2. Stories ───────────────────────────────────────────────
create table public.stories (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  lesson          text,
  body_html       text not null default '',
  excerpt         text,
  cover_url       text,
  accent_color    text default '#1a1208',
  read_time       integer default 5,       -- minutes
  status          text not null default 'draft'
                    check (status in ('draft','published','archived')),
  featured        boolean not null default false,
  featured_size   text default 'medium'
                    check (featured_size in ('large','medium','medium2')),
  featured_order  integer default 0,
  tags            text[] not null default '{}',
  author_id       uuid references public.profiles(id) on delete set null,
  view_count      integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Full-text search index
create index stories_fts_idx on public.stories
  using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body_html,'')));

create index stories_tags_idx     on public.stories using gin(tags);
create index stories_status_idx   on public.stories(status);
create index stories_featured_idx on public.stories(featured, featured_order);
create index stories_slug_idx     on public.stories(slug);

-- ── 3. Comments ──────────────────────────────────────────────
create table public.comments (
  id            uuid primary key default uuid_generate_v4(),
  story_id      uuid not null references public.stories(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete set null,
  parent_id     uuid references public.comments(id) on delete cascade,
  author_name   text,            -- for anonymous comments
  body          text not null,
  is_approved   boolean not null default true,
  like_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index comments_story_idx  on public.comments(story_id, created_at);
create index comments_parent_idx on public.comments(parent_id);

-- ── 4. Comment Likes ─────────────────────────────────────────
create table public.comment_likes (
  comment_id  uuid not null references public.comments(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- ── 5. Reactions ─────────────────────────────────────────────
create type public.reaction_type as enum (
  'understood','peaceful','emotional','heavy','inspired','seen','healing'
);

create table public.reactions (
  story_id    uuid not null references public.stories(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  session_id  text,             -- for anonymous reactions
  reaction    reaction_type not null,
  created_at  timestamptz not null default now(),
  -- A user OR session can only react once per story per reaction type
  constraint reactions_user_unique    unique (story_id, user_id, reaction),
  constraint reactions_session_unique unique (story_id, session_id, reaction)
);

create index reactions_story_idx on public.reactions(story_id, reaction);

-- ── 6. Ratings ───────────────────────────────────────────────
create table public.ratings (
  story_id    uuid not null references public.stories(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  session_id  text,
  stars       integer not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ratings_user_unique    unique (story_id, user_id),
  constraint ratings_session_unique unique (story_id, session_id)
);

-- ── 7. Bookmarks ─────────────────────────────────────────────
create table public.bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  story_id    uuid not null references public.stories(id) on delete cascade,
  collection  text not null default 'default',
  created_at  timestamptz not null default now(),
  unique (user_id, story_id)
);

create index bookmarks_user_idx on public.bookmarks(user_id, created_at desc);

-- ── 8. Reading Progress ──────────────────────────────────────
create table public.reading_progress (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  story_id     uuid not null references public.stories(id) on delete cascade,
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  completed    boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (user_id, story_id)
);

-- ── 9. Subscribers ───────────────────────────────────────────
create table public.subscribers (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  name          text,
  confirmed     boolean not null default false,
  confirm_token text unique,
  subscribed_at timestamptz not null default now(),
  user_id       uuid references public.profiles(id) on delete set null
);

create index subscribers_email_idx on public.subscribers(email);

-- ── 10. Story Views (analytics) ──────────────────────────────
create table public.story_views (
  id          uuid primary key default uuid_generate_v4(),
  story_id    uuid not null references public.stories(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  session_id  text,
  referrer    text,
  country     text,
  viewed_at   timestamptz not null default now()
);

create index story_views_story_idx on public.story_views(story_id, viewed_at desc);

-- ════════════════════════════════════════════════════════════
-- VIEWS — useful aggregations
-- ════════════════════════════════════════════════════════════

create or replace view public.story_stats as
  select
    s.id,
    s.slug,
    s.title,
    s.view_count,
    count(distinct c.id)                   as comment_count,
    count(distinct r.story_id)             as reaction_count,
    round(avg(rt.stars), 1)                as avg_rating,
    count(distinct rt.story_id)            as rating_count,
    count(distinct bk.id)                  as bookmark_count
  from public.stories s
  left join public.comments  c  on c.story_id = s.id and c.is_approved
  left join public.reactions r  on r.story_id = s.id
  left join public.ratings   rt on rt.story_id = s.id
  left join public.bookmarks bk on bk.story_id = s.id
  group by s.id, s.slug, s.title, s.view_count;

create or replace view public.reaction_counts as
  select
    story_id,
    reaction,
    count(*) as count
  from public.reactions
  group by story_id, reaction;

-- ════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ════════════════════════════════════════════════════════════

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_stories
  before update on public.stories
  for each row execute function public.set_updated_at();

create trigger set_updated_at_comments
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  admin_list text := current_setting('app.admin_emails', true);
begin
  insert into public.profiles (id, display_name, avatar_url, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email = any(string_to_array(coalesce(admin_list,''), ','))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Increment view count (deduped by session per day)
create or replace function public.increment_view(
  p_story_id  uuid,
  p_session_id text,
  p_user_id   uuid default null,
  p_referrer  text default null,
  p_country   text default null
) returns void language plpgsql security definer as $$
begin
  -- Only count once per session per day
  if not exists (
    select 1 from public.story_views
    where story_id  = p_story_id
      and session_id = p_session_id
      and viewed_at  > now() - interval '1 day'
  ) then
    insert into public.story_views (story_id, user_id, session_id, referrer, country)
    values (p_story_id, p_user_id, p_session_id, p_referrer, p_country);

    update public.stories
    set view_count = view_count + 1
    where id = p_story_id;
  end if;
end;
$$;

-- Full-text story search
create or replace function public.search_stories(query text)
returns setof public.stories language sql as $$
  select *
  from public.stories
  where status = 'published'
    and to_tsvector('english',
          coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body_html,'')
        ) @@ plainto_tsquery('english', query)
  order by ts_rank(
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'')),
    plainto_tsquery('english', query)
  ) desc;
$$;

-- Get trending stories (last 30 days by engagement)
create or replace function public.trending_stories(limit_count int default 6)
returns setof public.stories language sql as $$
  select s.*
  from public.stories s
  left join public.story_views sv on sv.story_id = s.id
    and sv.viewed_at > now() - interval '30 days'
  where s.status = 'published'
  group by s.id
  order by count(sv.id) desc, s.published_at desc
  limit limit_count;
$$;

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

alter table public.profiles          enable row level security;
alter table public.stories           enable row level security;
alter table public.comments          enable row level security;
alter table public.comment_likes     enable row level security;
alter table public.reactions         enable row level security;
alter table public.ratings           enable row level security;
alter table public.bookmarks         enable row level security;
alter table public.reading_progress  enable row level security;
alter table public.subscribers       enable row level security;
alter table public.story_views       enable row level security;

-- ── Profiles ──────────────────────────────────────────────
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Stories ───────────────────────────────────────────────
create policy "Published stories are publicly readable"
  on public.stories for select
  using (status = 'published' or auth.uid() in (
    select id from public.profiles where is_admin
  ));

create policy "Admins can insert stories"
  on public.stories for insert
  with check (auth.uid() in (
    select id from public.profiles where is_admin
  ));

create policy "Admins can update stories"
  on public.stories for update
  using (auth.uid() in (
    select id from public.profiles where is_admin
  ));

create policy "Admins can delete stories"
  on public.stories for delete
  using (auth.uid() in (
    select id from public.profiles where is_admin
  ));

-- ── Comments ──────────────────────────────────────────────
create policy "Approved comments are publicly readable"
  on public.comments for select
  using (is_approved = true);

create policy "Anyone can create comments"
  on public.comments for insert
  with check (true);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id or auth.uid() in (
    select id from public.profiles where is_admin
  ));

-- ── Reactions ─────────────────────────────────────────────
create policy "Reactions are publicly readable"
  on public.reactions for select using (true);

create policy "Anyone can react"
  on public.reactions for insert with check (true);

create policy "Users can delete own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- ── Ratings ───────────────────────────────────────────────
create policy "Ratings are publicly readable"
  on public.ratings for select using (true);

create policy "Anyone can rate"
  on public.ratings for insert with check (true);

create policy "Users can update own ratings"
  on public.ratings for update
  using (auth.uid() = user_id);

-- ── Bookmarks ─────────────────────────────────────────────
create policy "Users can read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can create bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- ── Reading Progress ──────────────────────────────────────
create policy "Users can read own progress"
  on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.reading_progress for update
  using (auth.uid() = user_id);

-- ── Subscribers ───────────────────────────────────────────
create policy "Admins can read subscribers"
  on public.subscribers for select
  using (auth.uid() in (
    select id from public.profiles where is_admin
  ));

create policy "Anyone can subscribe"
  on public.subscribers for insert with check (true);

create policy "Subscribers can update own record"
  on public.subscribers for update
  using (auth.uid() = user_id or confirm_token is not null);

-- ── Story Views ───────────────────────────────────────────
create policy "Admins can read views"
  on public.story_views for select
  using (auth.uid() in (
    select id from public.profiles where is_admin
  ));

create policy "Anyone can insert views"
  on public.story_views for insert with check (true);

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('story-covers', 'story-covers', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Story covers are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'story-covers');

create policy "Admins can upload story covers"
  on storage.objects for insert
  with check (
    bucket_id = 'story-covers' and
    auth.uid() in (select id from public.profiles where is_admin)
  );

create policy "Admins can update story covers"
  on storage.objects for update
  using (
    bucket_id = 'story-covers' and
    auth.uid() in (select id from public.profiles where is_admin)
  );

create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
