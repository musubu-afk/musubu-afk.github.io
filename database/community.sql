-- Additive community features; original stories, photos and shop reviews remain intact.
alter table public.places drop constraint places_language_check;
alter table public.places add constraint places_language_check check(language in ('ko','ja','en','zh-CN','zh-TW'));
create table public.place_edits (
 id bigint generated always as identity primary key,
 place_id uuid not null references public.places(id),
 previous_id bigint,
 name text not null check(char_length(trim(name)) between 2 and 80),
 reason text not null check(char_length(trim(reason)) between 10 and 1200),
 tip text not null default '' check(char_length(tip)<=300),
 address text not null default '' check(char_length(address)<=300),
 language text not null check(language in ('ko','ja','en','zh-CN','zh-TW')),
 edit_note text not null check(char_length(trim(edit_note)) between 2 and 200),
 created_at timestamptz not null default now()
);
alter table public.place_edits enable row level security;
revoke all on public.place_edits from anon,authenticated;
grant select on public.place_edits to anon;
grant insert(place_id,previous_id,name,reason,tip,address,language,edit_note) on public.place_edits to anon;
grant usage on sequence public.place_edits_id_seq to anon;
create policy edits_read on public.place_edits for select to anon using(exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create policy edits_append on public.place_edits for insert to anon with check(exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create index place_edits_latest on public.place_edits(place_id,id desc);
create function public.check_place_edit_version() returns trigger language plpgsql security invoker set search_path='' as $$
declare latest bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.place_id::text,0));
 select id into latest from public.place_edits where place_id=new.place_id order by id desc limit 1;
 if latest is distinct from new.previous_id then raise exception 'version_conflict';end if;
 return new;
end $$;
revoke all on function public.check_place_edit_version() from public,anon,authenticated;
create trigger place_edit_version before insert on public.place_edits for each row execute function public.check_place_edit_version();
create table public.place_reviews (
 id uuid primary key default gen_random_uuid(),place_id uuid not null references public.places(id),
 rating int not null check(rating between 1 and 5),review_text text not null check(char_length(trim(review_text)) between 2 and 1000),
 language text not null check(language in ('ko','ja','en','zh-CN','zh-TW')),
 status text not null default 'approved' check(status in ('approved','rejected')),
 created_at timestamptz not null default now()
);
alter table public.place_reviews enable row level security;
revoke all on public.place_reviews from anon,authenticated;
grant select on public.place_reviews to anon;
grant insert(id,place_id,rating,review_text,language) on public.place_reviews to anon;
create policy place_reviews_read on public.place_reviews for select to anon using(status='approved' and exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create policy place_reviews_insert on public.place_reviews for insert to anon with check(status='approved' and exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create index place_reviews_place on public.place_reviews(place_id,created_at desc);
create table public.place_review_edits (
 id bigint generated always as identity primary key,review_id uuid not null references public.place_reviews(id),previous_id bigint,
 rating int not null check(rating between 1 and 5),review_text text not null check(char_length(trim(review_text)) between 2 and 1000),
 language text not null check(language in ('ko','ja','en','zh-CN','zh-TW')),
 edit_note text not null check(char_length(trim(edit_note)) between 2 and 200),created_at timestamptz not null default now()
);
alter table public.place_review_edits enable row level security;
revoke all on public.place_review_edits from anon,authenticated;
grant select on public.place_review_edits to anon;
grant insert(review_id,previous_id,rating,review_text,language,edit_note) on public.place_review_edits to anon;
grant usage on sequence public.place_review_edits_id_seq to anon;
create policy review_edits_read on public.place_review_edits for select to anon using(exists(select 1 from public.place_reviews r where r.id=review_id));
create policy review_edits_insert on public.place_review_edits for insert to anon with check(exists(select 1 from public.place_reviews r where r.id=review_id));
create index review_edits_latest on public.place_review_edits(review_id,id desc);
create function public.check_review_edit_version() returns trigger language plpgsql security invoker set search_path='' as $$
declare latest bigint;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.review_id::text,1));
 select id into latest from public.place_review_edits where review_id=new.review_id order by id desc limit 1;
 if latest is distinct from new.previous_id then raise exception 'version_conflict';end if;
 return new;
end $$;
revoke all on function public.check_review_edit_version() from public,anon,authenticated;
create trigger review_edit_version before insert on public.place_review_edits for each row execute function public.check_review_edit_version();
-- A public hash identifies votes, never the browser's raw random identifier.
create table public.place_reactions (
 place_id uuid not null references public.places(id),
 visitor_hash text not null default encode(sha256(convert_to(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','UTF8')),'hex'),
 value int not null check(value in (-1,0,1)),created_at timestamptz not null default now(),primary key(place_id,visitor_hash)
);
insert into public.place_reactions(place_id,visitor_hash,value,created_at) select place_id,encode(sha256(convert_to(visitor_id::text,'UTF8')),'hex'),1,created_at from public.place_likes;
alter table public.place_reactions enable row level security;
revoke all on public.place_reactions from anon,authenticated;
grant select on public.place_reactions to anon;
grant insert(place_id,value),update(place_id,value) on public.place_reactions to anon;
create policy reaction_read on public.place_reactions for select to anon using(exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create policy reaction_insert on public.place_reactions for insert to anon with check(visitor_hash=encode(sha256(convert_to(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','UTF8')),'hex') and exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create policy reaction_update on public.place_reactions for update to anon using(visitor_hash=encode(sha256(convert_to(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','UTF8')),'hex')) with check(visitor_hash=encode(sha256(convert_to(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','UTF8')),'hex') and exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create function public.place_reaction_counts() returns table(place_id uuid,likes bigint,dislikes bigint) language sql stable security invoker set search_path='' as $$select place_id,count(*) filter(where value=1),count(*) filter(where value=-1) from public.place_reactions group by place_id$$;
revoke all on function public.place_reaction_counts() from public,authenticated;
grant execute on function public.place_reaction_counts() to anon;
create table public.community_rewards (
 id uuid primary key default gen_random_uuid(),
 visitor_id uuid not null default nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid,
 kind text not null check(kind in ('place','review')),source_id uuid not null,
 amount int not null default 1000 check(amount=1000),used boolean not null default false,created_at timestamptz not null default now(),
 unique(visitor_id,kind)
);
alter table public.community_rewards enable row level security;
revoke all on public.community_rewards from anon,authenticated;
grant select,insert on public.community_rewards to anon;
grant update(used) on public.community_rewards to anon;
create policy reward_read on public.community_rewards for select to anon using(visitor_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid);
create policy reward_trigger_only on public.community_rewards for insert to anon with check(pg_trigger_depth()>0 and visitor_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid and amount=1000 and not used);
create policy reward_use on public.community_rewards for update to anon using(visitor_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid and not used) with check(visitor_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid and used);
create function public.issue_community_reward() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','') is not null then
 insert into public.community_rewards(kind,source_id) values(TG_ARGV[0],new.id) on conflict(visitor_id,kind) do nothing;
 end if;
 return new;
end $$;
revoke all on function public.issue_community_reward() from public,anon,authenticated;
create trigger reward_new_place after insert on public.places for each row execute function public.issue_community_reward('place');
create trigger reward_new_place_review after insert on public.place_reviews for each row execute function public.issue_community_reward('review');
create table public.review_deletion_requests (
 id uuid primary key default gen_random_uuid(),review_id uuid not null references public.place_reviews(id),reason text not null check(char_length(trim(reason)) between 5 and 1000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),created_at timestamptz not null default now(),reviewed_at timestamptz
);
alter table public.review_deletion_requests enable row level security;
revoke all on public.review_deletion_requests from anon,authenticated;
grant insert(review_id,reason) on public.review_deletion_requests to anon;
create policy review_delete_request on public.review_deletion_requests for insert to anon with check(status='pending' and exists(select 1 from public.place_reviews r where r.id=review_id));
create function public.apply_review_deletion() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if new.status is distinct from old.status then new.reviewed_at=now();if new.status='approved' then update public.place_reviews set status='rejected' where id=new.review_id;end if;end if;return new;end $$;
revoke all on function public.apply_review_deletion() from public,anon,authenticated;
create trigger review_deletion_approved before update on public.review_deletion_requests for each row execute function public.apply_review_deletion();
alter publication supabase_realtime add table public.place_reviews,public.place_review_edits,public.place_edits,public.place_reactions;
