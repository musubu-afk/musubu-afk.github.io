-- Only the validating Edge Function may write image bytes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('review-photos','review-photos',false,1048576,array['image/jpeg']);

create schema if not exists musubu_media;
revoke all on schema musubu_media from public, anon, authenticated;
create table musubu_media.authors (
  kind text not null, review_id uuid not null, visitor_hash text not null,
  primary key(kind,review_id)
);
-- Every upload starts with a one-hour lease. Attaching it removes the expiry.
create table public.review_photo_uploads (
  path text primary key, visitor_hash text not null, expires_at timestamptz default now()+interval '1 hour',
  claimed boolean not null default false
);
alter table public.review_photo_uploads enable row level security;
revoke all on public.review_photo_uploads from public,anon,authenticated;
grant select,insert,update,delete on public.review_photo_uploads to service_role;
create index review_upload_expiry on public.review_photo_uploads(expires_at) where expires_at is not null;

alter table public.reviews add column photo_paths text[] not null default '{}' check(cardinality(photo_paths)<=3);
alter table public.place_reviews add column photo_paths text[] not null default '{}' check(cardinality(photo_paths)<=3);
grant select(photo_paths),insert(photo_paths) on public.reviews,public.place_reviews to anon;
create function musubu_media.visitor() returns text language sql stable set search_path='' as $$
 select encode(sha256(convert_to(nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid::text,'utf8')),'hex')
$$;

create function musubu_media.sync() returns trigger language plpgsql security definer set search_path='' as $$
declare k text; owner_hash text; previous text[] := '{}'; wanted text[] := '{}'; p text;
begin
 if tg_op <> 'INSERT' then previous:=old.photo_paths; end if;
 if tg_op <> 'DELETE' then
   wanted:=new.photo_paths;
   if tg_table_name='place_reviews' and to_jsonb(new)->>'status'='rejected' then wanted:='{}'; new.photo_paths:=wanted; end if;
 end if;
 k:=tg_table_name;
 if tg_op='INSERT' then
   owner_hash:=musubu_media.visitor();
   if owner_hash is not null then insert into musubu_media.authors values(k,new.id,owner_hash); end if;
 end if;
 if wanted is null or array_position(wanted,null) is not null or cardinality(wanted)>3 or cardinality(wanted)<>(select count(distinct v) from unnest(wanted) v) then raise exception 'invalid photos'; end if;
 foreach p in array wanted loop
   if p=any(previous) then continue; end if;
   update public.review_photo_uploads set claimed=true,expires_at=null
    where path=p and visitor_hash=musubu_media.visitor() and not claimed and expires_at>now()
      and exists(select 1 from storage.objects where bucket_id='review-photos' and name=p);
   if not found then raise exception 'unavailable photo'; end if;
 end loop;
 update public.review_photo_uploads set expires_at=now() where path=any(previous) and not(path=any(wanted));
 if tg_op='DELETE' then delete from musubu_media.authors where kind=k and review_id=old.id; return old; end if;
 return new;
end $$;
create trigger review_photo_sync before insert or update of photo_paths or delete on public.reviews for each row execute function musubu_media.sync();
create trigger place_review_photo_sync before insert or update of photo_paths,status or delete on public.place_reviews for each row execute function musubu_media.sync();

create function public.edit_review_photos(kind text,review_id uuid,previous text[],photos text[]) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from musubu_media.authors a where a.kind=$1 and a.review_id=$2 and a.visitor_hash=musubu_media.visitor()) then raise exception 'not owner'; end if;
 if kind='reviews' then update public.reviews set photo_paths=photos where id=review_id and photo_paths=previous;
 elsif kind='place_reviews' then update public.place_reviews set photo_paths=photos where id=review_id and photo_paths=previous and status='approved';
 else raise exception 'invalid kind'; end if;
 if not found then raise exception 'review changed'; end if;
end $$;
revoke all on function public.edit_review_photos(text,uuid,text[],text[]) from public;
grant execute on function public.edit_review_photos(text,uuid,text[],text[]) to anon;
create policy read_published_review_photos on storage.objects for select to anon
using (bucket_id='review-photos' and
 (exists(select 1 from public.reviews r where name=any(r.photo_paths)) or
  exists(select 1 from public.place_reviews r where name=any(r.photo_paths))));

-- Lock expired leases against late attachment before the worker deletes bytes.
create function public.expired_review_photos() returns table(path text)
language sql security definer set search_path='' as $$
 update public.review_photo_uploads u set claimed=true
 where u.path in (select q.path from public.review_photo_uploads q where q.expires_at<=now() order by q.expires_at limit 100 for update skip locked)
 returning u.path
$$;
revoke all on function public.expired_review_photos() from public,anon,authenticated;
grant execute on function public.expired_review_photos() to service_role;

create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('musubu-review-photo-cleanup','*/15 * * * *',$job$
 select net.http_post(
  url:='https://fzynbjgkictmlmuxfldl.supabase.co/functions/v1/review-photos?cleanup=1',
  headers:='{"Content-Type":"application/json","apikey":"sb_publishable_x08dJFDQ_zuP0IKJ83jFYg_1so-HCCN"}'::jsonb,
  body:='{}'::jsonb)
$job$);
