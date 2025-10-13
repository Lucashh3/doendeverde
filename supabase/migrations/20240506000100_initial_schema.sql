-- Initial schema for Doende Verde
-- Generated for Supabase (Postgres)

begin;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists citext;

create type moderation_status as enum ('active', 'shadowbanned', 'banned');

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  display_name text,
  avatar_url text,
  bio text,
  xp integer not null default 0,
  level text not null default 'Iniciante' check (level in ('Iniciante', 'Entusiasta', 'Grower Sênior', 'Cultivador Indoor')),
  pseudonymous boolean not null default true,
  share_activity boolean not null default false,
  email_notifications boolean not null default false,
  onboarding_completed boolean not null default false,
  moderation_status moderation_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id bigint generated always as identity primary key,
  slug citext not null unique,
  label text not null,
  description text,
  icon text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete restrict,
  title text not null,
  content text,
  media_url text,
  media_type text,
  link_preview jsonb,
  is_pinned boolean not null default false,
  is_deleted boolean not null default false,
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  depth smallint not null default 0 check (depth between 0 and 1),
  body text not null,
  upvotes_count integer not null default 0,
  downvotes_count integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (comment_id, user_id)
);

create table public.tags (
  id bigint generated always as identity primary key,
  slug citext not null unique,
  label text not null,
  usage_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, tag_id)
);

create table public.badges (
  code text primary key,
  name text not null,
  description text not null,
  icon text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.level_thresholds (
  level text primary key,
  min_xp integer not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_code text not null references public.badges(code) on delete cascade,
  awarded_at timestamptz not null default timezone('utc', now())
);

create table public.xp_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  source text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_posts_category_created on public.posts (category_id, created_at desc);
create index if not exists idx_posts_author_created on public.posts (author_id, created_at desc);
create index if not exists idx_comments_post_created on public.comments (post_id, created_at asc);
create index if not exists idx_xp_history_user_created on public.xp_history (user_id, created_at desc);
create index if not exists idx_moderation_actions_target on public.moderation_actions (target_type, target_id);

create unique index if not exists idx_profiles_username_lower on public.profiles (lower(username::text));

create or replace view public.leaderboard_weekly as
select
  p.id as user_id,
  p.username,
  coalesce(sum(x.delta), 0) as xp_gain,
  dense_rank() over (order by coalesce(sum(x.delta), 0) desc) as rank
from public.profiles p
left join public.xp_history x on x.user_id = p.id and x.created_at >= timezone('utc', now()) - interval '7 days'
group by p.id, p.username;

create or replace function public.register_audit_event(action text, metadata jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_id, action, metadata)
  values (auth.uid(), action, coalesce(metadata, '{}'::jsonb));
end;
$$;

-- Ensure auth users can execute the audit function
grant execute on function public.register_audit_event(text, jsonb) to authenticated;

-- Triggers
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger trg_posts_updated_at
before update on public.posts
for each row
execute function public.handle_updated_at();

create trigger trg_comments_updated_at
before update on public.comments
for each row
execute function public.handle_updated_at();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_votes enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_history enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.post_tags enable row level security;
alter table public.tags enable row level security;
alter table public.categories enable row level security;
alter table public.level_thresholds enable row level security;

create policy "Profiles are viewable" on public.profiles
for select using (true);

create policy "User manages own profile" on public.profiles
for insert
with check (auth.uid() = id);

create policy "User can update own profile" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Posts readable" on public.posts
for select using (is_deleted = false or auth.uid() = author_id);

create policy "Create posts" on public.posts
for insert with check (auth.uid() = author_id);

create policy "Update own posts" on public.posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Soft delete own posts" on public.posts
for delete using (auth.uid() = author_id);

create policy "Vote on posts" on public.post_votes
for insert with check (auth.uid() = user_id);

create policy "Update own vote" on public.post_votes
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Remove own vote" on public.post_votes
for delete using (auth.uid() = user_id);

create policy "Comments readable" on public.comments
for select using (is_deleted = false or auth.uid() = author_id);

create policy "Create comments" on public.comments
for insert with check (auth.uid() = author_id);

create policy "Update own comments" on public.comments
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Comment votes" on public.comment_votes
for insert with check (auth.uid() = user_id);

create policy "Update comment vote" on public.comment_votes
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Delete comment vote" on public.comment_votes
for delete using (auth.uid() = user_id);

create policy "Badges readable" on public.badges for select using (true);
create policy "Levels readable" on public.level_thresholds for select using (true);
create policy "User badge view" on public.user_badges for select using (true);
create policy "User badge insert" on public.user_badges
for insert with check (auth.uid() = user_id);

create policy "XP history view" on public.xp_history
for select using (auth.uid() = user_id);

create policy "XP history insert" on public.xp_history
for insert with check (auth.uid() = user_id);

create policy "Categories readable" on public.categories for select using (true);
create policy "Tags readable" on public.tags for select using (true);
create policy "Post tags readable" on public.post_tags for select using (true);
create policy "Users can create tags" on public.tags
for insert
with check (auth.role() = 'authenticated');

create policy "Users can tag posts" on public.post_tags
for insert
with check (auth.role() = 'authenticated');

-- Moderation tables accessible only by service role; rely on bypass via service role so policies deny by default

commit;
