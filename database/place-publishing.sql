-- Immediate public submissions; team-reviewed deletion requests.
alter table public.places add column address text not null default '' check (char_length(address)<=300);
alter table public.places alter column status set default 'approved';
grant select(address), insert(address) on public.places to anon;
alter policy places_pending_insert on public.places with check (
 status='approved' and kind='resident' and story_key is null and not is_example
 and author_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid
 and exists(select 1 from public.tour_regions r where r.id=places.region
 and places.latitude between (r.bounds->0->>0)::float8 and (r.bounds->1->>0)::float8
 and places.longitude between (r.bounds->0->>1)::float8 and (r.bounds->1->>1)::float8));
alter policy places_pending_insert on public.places rename to places_public_insert;
create table public.place_deletion_requests (
 id uuid primary key default gen_random_uuid(),
 place_id uuid not null references public.places(id),
 reason text not null check(char_length(trim(reason)) between 5 and 1000),
 requester_id uuid not null default nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), reviewed_at timestamptz,
 unique(place_id,requester_id)
);
alter table public.place_deletion_requests enable row level security;
revoke all on public.place_deletion_requests from anon,authenticated;
grant insert(place_id,reason) on public.place_deletion_requests to anon;
create policy deletion_request_insert on public.place_deletion_requests for insert to anon with check (
 status='pending' and requester_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid
 and exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create function public.apply_place_deletion() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.status is distinct from old.status then
  new.reviewed_at=now();
  if new.status='approved' then
   update public.places set status='rejected',reviewed_at=now(),moderation_note='Approved deletion request: '||new.id::text where id=new.place_id;
  end if;
 end if;
 return new;
end $$;
revoke all on function public.apply_place_deletion() from public,anon,authenticated;
create trigger approved_deletion before update on public.place_deletion_requests for each row execute function public.apply_place_deletion();
create index deletion_pending on public.place_deletion_requests(status,created_at);
