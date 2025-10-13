begin;

alter table public.profiles
add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

create table if not exists public.post_flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id) on delete set null,
  resolution_notes text
);

create unique index if not exists idx_post_flags_unique_report on public.post_flags (post_id, reporter_id);
create index if not exists idx_post_flags_status_created on public.post_flags (status, created_at desc);

create table if not exists public.moderation_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  alert_type text not null,
  severity text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

create index if not exists idx_moderation_alerts_type_created on public.moderation_alerts (alert_type, created_at desc);
create index if not exists idx_moderation_alerts_user on public.moderation_alerts (user_id);

alter table public.post_flags enable row level security;
alter table public.moderation_alerts enable row level security;

-- Update existing policies to account for admins
drop policy if exists "User can update own profile" on public.profiles;
create policy "User can update own profile" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "Update own posts" on public.posts;
create policy "Manage posts (author or admin)" on public.posts
for update using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "Soft delete own posts" on public.posts;
create policy "Delete posts (author or admin)" on public.posts
for delete using (auth.uid() = author_id or public.is_admin());

drop policy if exists "Update own comments" on public.comments;
create policy "Edit comments (author or admin)" on public.comments
for update using (auth.uid() = author_id or public.is_admin())
with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "Create comments" on public.comments;
create policy "Create comments" on public.comments
for insert with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "Create posts" on public.posts;
create policy "Create posts" on public.posts
for insert with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "User manages own profile" on public.profiles;
create policy "User manages own profile" on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

create policy "Admins can view all post flags" on public.post_flags
for select using (public.is_admin());

create policy "Users can flag posts" on public.post_flags
for insert
with check (auth.uid() = reporter_id);

create policy "Reporter can view own flags" on public.post_flags
for select using (auth.uid() = reporter_id);

create policy "Admins manage post flags" on public.post_flags
for update using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage alerts" on public.moderation_alerts
for all using (public.is_admin())
with check (public.is_admin());

create policy "Users view own alerts" on public.moderation_alerts
for select using (auth.uid() = user_id);

create or replace function public.admin_update_moderation_status(
  target_user uuid,
  new_status moderation_status,
  reason text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem executar esta ação.';
  end if;

  update public.profiles
  set moderation_status = new_status
  where id = target_user;

  insert into public.moderation_actions (actor_id, target_type, target_id, action, reason, metadata)
  values (
    actor,
    'profile',
    target_user,
    'status_change',
    reason,
    jsonb_build_object('status', new_status)
  );
end;
$$;

create or replace function public.admin_remove_post(target_post uuid, reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem executar esta ação.';
  end if;

  update public.posts
  set is_deleted = true,
      content = '[removido pela moderação]'
  where id = target_post;

  insert into public.moderation_actions (actor_id, target_type, target_id, action, reason)
  values (actor, 'post', target_post, 'removed', reason);
end;
$$;

create or replace function public.admin_restore_post(target_post uuid, reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Somente administradores podem executar esta ação.';
  end if;

  update public.posts
  set is_deleted = false
  where id = target_post;

  insert into public.moderation_actions (actor_id, target_type, target_id, action, reason)
  values (actor, 'post', target_post, 'restored', reason);
end;
$$;

create or replace function public.handle_post_flag_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.moderation_alerts (user_id, alert_type, severity, metadata)
  values (
    new.reporter_id,
    'post_flagged',
    'medium',
    jsonb_build_object('post_id', new.post_id, 'flag_id', new.id, 'reason', new.reason)
  );
  return new;
end;
$$;

drop trigger if exists trg_post_flags_alert on public.post_flags;
create trigger trg_post_flags_alert
after insert on public.post_flags
for each row
execute function public.handle_post_flag_alert();

create or replace function public.handle_post_rate_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_posts integer;
begin
  select count(*) into recent_posts
  from public.posts
  where author_id = new.author_id
    and created_at >= timezone('utc', now()) - interval '10 minutes';

  if recent_posts >= 5 then
    insert into public.moderation_alerts (user_id, alert_type, severity, metadata)
    values (
      new.author_id,
      'high_post_frequency',
      'high',
      jsonb_build_object('post_id', new.id, 'recent_posts', recent_posts)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_posts_rate_alert on public.posts;
create trigger trg_posts_rate_alert
after insert on public.posts
for each row
execute function public.handle_post_rate_alert();

commit;
