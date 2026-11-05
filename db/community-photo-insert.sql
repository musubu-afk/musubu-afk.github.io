-- Existing place INSERT policies and approved-only reads remain in force.
create schema if not exists musubu_private;
create or replace function musubu_private.check_place_submission()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  source_path text;
  prefix constant text := 'https://fzynbjgkictmlmuxfldl.supabase.co/storage/v1/object/public/place-photos/';
begin
  if current_setting('role', true) <> 'anon' then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text, 42));
  if (select count(*) from public.places p where p.author_id = new.author_id
      and p.created_at > now()-interval '1 hour' and p.id <> new.id) >= 5 then
    raise exception 'musubu_registration_limit';
  end if;
  if new.image_url is not null then
    source_path := substr(new.image_url, length(prefix)+1);
    if left(new.image_url,length(prefix)) <> prefix
       or split_part(source_path,'/',1) <> new.author_id::text
       or source_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}[.]jpg$'
       or not exists (select 1 from storage.objects o where o.bucket_id='place-photos'
                      and o.name=source_path and o.metadata->>'mimetype'='image/jpeg'
                      and (o.metadata->>'size')::bigint between 1 and 1048576) then
      raise exception 'musubu_invalid_place_photo';
    end if;
  end if;
  return new;
end $$;
revoke all on function musubu_private.check_place_submission() from public,anon,authenticated;
create trigger check_community_place before insert on public.places
for each row execute function musubu_private.check_place_submission();
grant insert (image_url) on public.places to anon;
