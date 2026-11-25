-- Login-free bearer credential, signed by a key inaccessible to API roles.
create table musubu_media.signing_key (secret bytea not null);
insert into musubu_media.signing_key values (extensions.gen_random_bytes(32));
create function public.issue_review_credential() returns text language sql volatile security definer set search_path='' as $$
 with nonce as materialized (select encode(extensions.gen_random_bytes(32),'hex') n)
 select n||'.'||encode(extensions.hmac(convert_to(n,'UTF8'),secret,'sha256'),'hex') from nonce,musubu_media.signing_key
$$;
create function musubu_media.principal() returns text language sql stable security definer set search_path='' as $$
 with token as (select current_setting('request.headers',true)::jsonb->>'x-review-credential' t)
 select split_part(t,'.',1) from token,musubu_media.signing_key
 where t ~ '^[0-9a-f]{64}[.][0-9a-f]{64}$' and split_part(t,'.',2)=encode(extensions.hmac(convert_to(split_part(t,'.',1),'UTF8'),secret,'sha256'),'hex')
$$;
create table musubu_media.review_owners(kind text not null,review_id uuid not null,principal text not null,primary key(kind,review_id));
create index on musubu_media.review_owners(principal,kind);
create function musubu_media.track_owner() returns trigger language plpgsql security definer set search_path='' as $$
declare who text:=musubu_media.principal();
begin
 if tg_op='DELETE' then delete from musubu_media.review_owners where kind=tg_table_name and review_id=old.id;return old;end if;
 if who is not null then insert into musubu_media.review_owners values(tg_table_name,new.id,who);end if;
 return new;
end $$;
create trigger review_owner after insert or delete on public.reviews for each row execute function musubu_media.track_owner();
create trigger review_owner after insert or delete on public.place_reviews for each row execute function musubu_media.track_owner();
create function public.my_review_ids() returns table(kind text,review_id uuid) language sql stable security definer set search_path='' as $$
 select o.kind,o.review_id from musubu_media.review_owners o where o.principal=musubu_media.principal()
$$;
-- Clients can read all published revisions. Only the checked RPC may create one.
drop policy review_edits_insert on public.place_review_edits;
revoke insert(review_id,previous_id,rating,review_text,language,edit_note) on public.place_review_edits from anon;
revoke execute on function public.edit_review_photos(text,uuid,text[],text[]) from anon,authenticated,public;

create table public.shop_review_history(id bigint generated always as identity primary key,review_id uuid not null,rating int not null,review_text text not null,created_at timestamptz not null);
create index on public.shop_review_history(review_id,id desc);
alter table public.shop_review_history enable row level security;
revoke all on public.shop_review_history from public,anon,authenticated;
grant select on public.shop_review_history to anon;
create policy shop_review_history_read on public.shop_review_history for select to anon using(exists(select 1 from public.reviews r where r.id=review_id));

create function public.revise_visitor_review(k text,rid uuid,old_text text,old_rating int,old_photos text[],body text,stars int,photos text[],lang text)
returns void language plpgsql security definer set search_path='' as $$
declare prev public.place_review_edits; p public.place_reviews; s public.reviews;
begin
 if not exists(select 1 from public.my_review_ids() a where a.kind=k and a.review_id=rid) then raise exception 'author required' using errcode='42501';end if;
 if k='reviews' then
  select * into strict s from public.reviews where id=rid for update;
  if (s.rating,s.review_text,s.photo_paths) is distinct from (old_rating,old_text,old_photos) then raise exception 'version_conflict';end if;
  insert into public.shop_review_history(review_id,rating,review_text,created_at) values(rid,s.rating,s.review_text,now());
  update public.reviews set rating=stars,review_text=btrim(body),photo_paths=photos where id=rid;
 elsif k='place_reviews' then
  select * into strict p from public.place_reviews where id=rid and status='approved' and exists(select 1 from public.places v where v.id=place_id and v.status='approved') for update;
  select * into prev from public.place_review_edits where review_id=rid order by id desc limit 1;
  if (coalesce(prev.rating,p.rating),coalesce(prev.review_text,p.review_text),p.photo_paths) is distinct from (old_rating,old_text,old_photos) then raise exception 'version_conflict';end if;
  insert into public.place_review_edits(review_id,previous_id,rating,review_text,language,edit_note) values(rid,prev.id,stars,btrim(body),lang,case when lang='ja' then '投稿者による編集' else '작성자 수정' end);
  update public.place_reviews set photo_paths=photos where id=rid;
 else raise exception 'unknown review type';end if;
end $$;
revoke all on function public.issue_review_credential(),public.my_review_ids(),public.revise_visitor_review(text,uuid,text,int,text[],text,int,text[],text) from public,authenticated;
grant execute on function public.issue_review_credential(),public.my_review_ids(),public.revise_visitor_review(text,uuid,text,int,text[],text,int,text[],text) to anon;

alter table public.review_deletion_requests alter column review_id drop not null,add column shop_review_id uuid,add check(num_nonnulls(review_id,shop_review_id)=1);
grant insert(shop_review_id) on public.review_deletion_requests to anon;
create policy shop_review_delete_request on public.review_deletion_requests for insert to anon with check(status='pending' and exists(select 1 from public.reviews r where r.id=shop_review_id));
create or replace function public.apply_review_deletion() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.status is distinct from old.status then
  new.reviewed_at=now();
  if new.status='approved' then
   if new.review_id is not null then update public.place_reviews set status='rejected' where id=new.review_id;
   else delete from public.reviews where id=new.shop_review_id; end if;
  end if;
 end if;
 return new;
end $$;
