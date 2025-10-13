begin;

create extension if not exists pg_trgm;

alter table public.posts
add column if not exists popularity_score double precision not null default 0;

create index if not exists idx_posts_popularity_score on public.posts (popularity_score desc);
create index if not exists idx_posts_category_popularity on public.posts (category_id, popularity_score desc);
create index if not exists idx_posts_title_trgm on public.posts using gin (title gin_trgm_ops);
create index if not exists idx_posts_content_trgm on public.posts using gin (content gin_trgm_ops);

create index if not exists idx_tags_label_trgm on public.tags using gin (label gin_trgm_ops);
create index if not exists idx_post_tags_tag_id on public.post_tags (tag_id);

create or replace function public.calculate_post_popularity_score(
  upvotes integer,
  downvotes integer,
  comments integer,
  created timestamptz,
  reference timestamptz default timezone('utc', now())
) returns double precision
language plpgsql
stable
as $$
declare
  age_days double precision;
  base_score double precision;
begin
  age_days := greatest(extract(epoch from (reference - created)) / 86400.0, 0);
  base_score := (upvotes * 4) + (comments * 3) - (downvotes * 2);
  return round(base_score * exp(-age_days / 10.0), 4);
end;
$$;

create or replace function public.recalculate_post_popularity()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.posts as p
  set popularity_score = public.calculate_post_popularity_score(
    p.upvotes_count,
    p.downvotes_count,
    p.comments_count,
    p.created_at,
    timezone('utc', now())
  );

  get diagnostics updated_count = row_count;

  return coalesce(updated_count, 0);
end;
$$;

create or replace function public.search_tags(term text, limit_count integer default 8)
returns table (slug text, label text, usage_count integer, score double precision)
language plpgsql
security definer
set search_path = public
as $$
begin
  if term is null or btrim(term) = '' then
    return query
    select t.slug, t.label, t.usage_count, 0::double precision as score
    from public.tags t
    order by t.usage_count desc, t.label
    limit limit_count;
  end if;

  return query
  select
    t.slug,
    t.label,
    t.usage_count,
    similarity(t.label, term) as score
  from public.tags t
  where similarity(t.label, term) >= 0.2
     or t.label ilike concat('%', term, '%')
  order by score desc, t.usage_count desc, t.label
  limit limit_count;
end;
$$;

comment on function public.recalculate_post_popularity() is
  'Recalcula a pontuação de popularidade de todos os posts. Agendar via Supabase Scheduled Functions ou Vercel Cron.';

comment on function public.search_tags(text, integer) is
  'Retorna sugestões de tags com base em similaridade trigram.';

grant execute on function public.search_tags(text, integer) to authenticated, anon;
grant execute on function public.recalculate_post_popularity() to service_role;

create or replace function public.refresh_tag_usage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.tags
    set usage_count = usage_count + 1
    where id = new.tag_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.tags
    set usage_count = greatest(usage_count - 1, 0)
    where id = old.tag_id;
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_post_tags_usage on public.post_tags;

create trigger trg_post_tags_usage
after insert or delete on public.post_tags
for each row
execute function public.refresh_tag_usage();

create or replace function public.refresh_post_metrics(target_post uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upvote_count integer;
  v_downvote_count integer;
  v_comments_count integer;
begin
  select count(*) into v_upvote_count
  from public.post_votes
  where post_id = target_post
    and value = 1;

  select count(*) into v_downvote_count
  from public.post_votes
  where post_id = target_post
    and value = -1;

  select count(*) into v_comments_count
  from public.comments
  where post_id = target_post
    and is_deleted = false;

  update public.posts as p
  set
    upvotes_count = coalesce(v_upvote_count, 0),
    downvotes_count = coalesce(v_downvote_count, 0),
    comments_count = coalesce(v_comments_count, 0),
    popularity_score = public.calculate_post_popularity_score(
      coalesce(v_upvote_count, 0),
      coalesce(v_downvote_count, 0),
      coalesce(v_comments_count, 0),
      p.created_at,
      timezone('utc', now())
    )
  where p.id = target_post;
end;
$$;

create or replace function public.handle_post_votes_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_post_metrics(coalesce(new.post_id, old.post_id));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.handle_post_comments_metrics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_post_metrics(coalesce(new.post_id, old.post_id));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_post_votes_metrics on public.post_votes;

create trigger trg_post_votes_metrics
after insert or update or delete on public.post_votes
for each row
execute function public.handle_post_votes_metrics();

drop trigger if exists trg_post_comments_metrics on public.comments;

create trigger trg_post_comments_metrics
after insert or update or delete on public.comments
for each row
execute function public.handle_post_comments_metrics();

select public.refresh_post_metrics(id) from public.posts;

commit;
