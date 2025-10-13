begin;

create unique index if not exists idx_user_badges_user_code on public.user_badges (user_id, badge_code);

create or replace function public.grant_badge_if_missing(target_user uuid, badge_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  insert into public.user_badges (user_id, badge_code)
  values (target_user, badge_code)
  on conflict (user_id, badge_code) do nothing;

  get diagnostics inserted = row_count;

  return inserted > 0;
end;
$$;

create or replace function public.calculate_level_from_xp(total_xp integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  level_name text;
begin
  select lt.level
  into level_name
  from public.level_thresholds lt
  where lt.min_xp <= coalesce(total_xp, 0)
  order by lt.min_xp desc
  limit 1;

  if level_name is null then
    level_name := 'Iniciante';
  end if;

  return level_name;
end;
$$;

create or replace function public.apply_profile_xp_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles as p
  set
    xp = greatest(0, p.xp + new.delta),
    level = public.calculate_level_from_xp(greatest(0, p.xp + new.delta))
  where p.id = new.user_id;

  return new;
end;
$$;

drop trigger if exists trg_xp_history_apply_profile on public.xp_history;

create trigger trg_xp_history_apply_profile
after insert on public.xp_history
for each row
execute function public.apply_profile_xp_progress();

create or replace function public.handle_post_creation_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  posts_count integer;
begin
  insert into public.xp_history (user_id, delta, source, metadata)
  values (
    new.author_id,
    5,
    'post:create',
    jsonb_build_object('post_id', new.id)
  );

  select count(*) into posts_count
  from public.posts
  where author_id = new.author_id;

  if posts_count = 1 then
    perform public.grant_badge_if_missing(new.author_id, 'primeira-colheita');
  end if;

  if posts_count >= 100 then
    perform public.grant_badge_if_missing(new.author_id, 'brisado-lendario');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_posts_gamification on public.posts;

create trigger trg_posts_gamification
after insert on public.posts
for each row
execute function public.handle_post_creation_gamification();

create or replace function public.handle_comment_creation_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comments_count integer;
begin
  insert into public.xp_history (user_id, delta, source, metadata)
  values (
    new.author_id,
    2,
    'comment:create',
    jsonb_build_object('comment_id', new.id, 'post_id', new.post_id)
  );

  select count(*) into comments_count
  from public.comments
  where author_id = new.author_id;

  if comments_count >= 10 then
    perform public.grant_badge_if_missing(new.author_id, 'curioso-iluminado');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_comments_gamification on public.comments;

create trigger trg_comments_gamification
after insert on public.comments
for each row
execute function public.handle_comment_creation_gamification();

create or replace function public.handle_post_vote_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  vote_user uuid;
  target_post uuid;
  xp_delta integer := 0;
begin
  if tg_op = 'INSERT' then
    vote_user := new.user_id;
    target_post := new.post_id;
    if new.value = 1 then
      xp_delta := 1;
    end if;
  elsif tg_op = 'UPDATE' then
    vote_user := new.user_id;
    target_post := new.post_id;
    if new.value = old.value then
      return new;
    end if;
    if new.value = 1 then
      xp_delta := 1;
    elsif old.value = 1 then
      xp_delta := -1;
    end if;
  elsif tg_op = 'DELETE' then
    vote_user := old.user_id;
    target_post := old.post_id;
    if old.value = 1 then
      xp_delta := -1;
    end if;
  end if;

  if xp_delta = 0 then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  select author_id into post_author
  from public.posts
  where id = target_post;

  if post_author is null or post_author = vote_user then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  insert into public.xp_history (user_id, delta, source, metadata)
  values (
    post_author,
    xp_delta,
    'post:upvote_received',
    jsonb_build_object(
      'post_id', target_post,
      'from_user_id', vote_user,
      'operation', tg_op
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_post_votes_gamification_insert on public.post_votes;
drop trigger if exists trg_post_votes_gamification_update on public.post_votes;
drop trigger if exists trg_post_votes_gamification_delete on public.post_votes;

create trigger trg_post_votes_gamification_insert
after insert on public.post_votes
for each row
execute function public.handle_post_vote_gamification();

create trigger trg_post_votes_gamification_update
after update on public.post_votes
for each row
execute function public.handle_post_vote_gamification();

create trigger trg_post_votes_gamification_delete
after delete on public.post_votes
for each row
execute function public.handle_post_vote_gamification();

create or replace function public.handle_comment_vote_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_author uuid;
  vote_user uuid;
  target_comment uuid;
  xp_delta integer := 0;
begin
  if tg_op = 'INSERT' then
    vote_user := new.user_id;
    target_comment := new.comment_id;
    if new.value = 1 then
      xp_delta := 1;
    end if;
  elsif tg_op = 'UPDATE' then
    vote_user := new.user_id;
    target_comment := new.comment_id;
    if new.value = old.value then
      return new;
    end if;
    if new.value = 1 then
      xp_delta := 1;
    elsif old.value = 1 then
      xp_delta := -1;
    end if;
  elsif tg_op = 'DELETE' then
    vote_user := old.user_id;
    target_comment := old.comment_id;
    if old.value = 1 then
      xp_delta := -1;
    end if;
  end if;

  if xp_delta = 0 then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  select author_id into comment_author
  from public.comments
  where id = target_comment;

  if comment_author is null or comment_author = vote_user then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  insert into public.xp_history (user_id, delta, source, metadata)
  values (
    comment_author,
    xp_delta,
    'comment:upvote_received',
    jsonb_build_object(
      'comment_id', target_comment,
      'from_user_id', vote_user,
      'operation', tg_op
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_comment_votes_gamification_insert on public.comment_votes;
drop trigger if exists trg_comment_votes_gamification_update on public.comment_votes;
drop trigger if exists trg_comment_votes_gamification_delete on public.comment_votes;

create trigger trg_comment_votes_gamification_insert
after insert on public.comment_votes
for each row
execute function public.handle_comment_vote_gamification();

create trigger trg_comment_votes_gamification_update
after update on public.comment_votes
for each row
execute function public.handle_comment_vote_gamification();

create trigger trg_comment_votes_gamification_delete
after delete on public.comment_votes
for each row
execute function public.handle_comment_vote_gamification();

create or replace function public.handle_post_tag_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  tag_slug text;
begin
  select t.slug into tag_slug
  from public.tags t
  where t.id = new.tag_id;

  if tag_slug is distinct from 'indoor' then
    return new;
  end if;

  select author_id into post_author
  from public.posts
  where id = new.post_id;

  if post_author is null then
    return new;
  end if;

  perform public.grant_badge_if_missing(post_author, 'cultivador-indoor');

  return new;
end;
$$;

drop trigger if exists trg_post_tags_gamification on public.post_tags;

create trigger trg_post_tags_gamification
after insert on public.post_tags
for each row
execute function public.handle_post_tag_gamification();

commit;
