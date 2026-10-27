-- Additive Phase 1 schema. Existing shops/reviews are unchanged.
create table public.tour_regions (
 id text primary key, name_ko text not null, name_ja text not null,
 latitude double precision not null, longitude double precision not null,
 zoom smallint not null default 13, bounds jsonb not null
);
alter table public.tour_regions enable row level security;
revoke all on public.tour_regions from anon, authenticated;
grant select on public.tour_regions to anon;
create policy regions_read on public.tour_regions for select to anon using (true);
insert into public.tour_regions values
 ('nonsan','논산','論山',36.190,127.170,12,'[[36.04,126.98],[36.36,127.40]]'),
 ('fukuoka','후쿠오카','福岡',33.588,130.380,14,'[[33.1,130.0],[33.9,131.6]]');
create table public.places (
 id uuid primary key default gen_random_uuid(),
 region text not null references public.tour_regions(id),
 latitude double precision not null check(latitude between -85 and 85),
 longitude double precision not null check(longitude between -180 and 180),
 name text not null check(char_length(btrim(name)) between 2 and 80),
 kind text not null default 'resident' check(kind in ('official','resident','walk')),
 category text not null check(category in ('scenery','walk','photo','rest','local','other')),
 reason text not null check(char_length(btrim(reason)) between 10 and 1200),
 tip text not null default '' check(char_length(tip)<=300),
 language text not null check(language in ('ko','ja')),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 story_key text unique, translations jsonb not null default '{}',
 image_url text, audio_urls jsonb not null default '{}',
 route_points jsonb, distance_m integer, duration_minutes integer,
 is_example boolean not null default false,
 created_at timestamptz not null default now(),
 author_id uuid not null default nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid,
 reviewed_at timestamptz, moderation_note text
);
create index places_region_status_idx on public.places(region,status,created_at desc);
alter table public.places enable row level security;
revoke all on public.places from anon,authenticated;
grant select(id,region,latitude,longitude,name,kind,category,reason,tip,language,status,story_key,translations,image_url,audio_urls,route_points,distance_m,duration_minutes,is_example,created_at) on public.places to anon;
grant insert(id,region,latitude,longitude,name,category,reason,tip,language) on public.places to anon;
create policy places_approved_read on public.places for select to anon using(status='approved');
create policy places_pending_insert on public.places for insert to anon with check(
 status='pending' and kind='resident' and story_key is null and not is_example
 and author_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid
 and exists(select 1 from public.tour_regions r where r.id=places.region
 and places.latitude between (r.bounds->0->>0)::float8 and (r.bounds->1->>0)::float8
 and places.longitude between (r.bounds->0->>1)::float8 and (r.bounds->1->>1)::float8)
);
create table public.place_likes (
 place_id uuid not null references public.places(id) on delete cascade,
 visitor_id uuid not null default nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid,
 created_at timestamptz not null default now(),primary key(place_id,visitor_id)
);
alter table public.place_likes enable row level security;
revoke all on public.place_likes from anon,authenticated;
grant select(place_id) on public.place_likes to anon;
grant insert(place_id) on public.place_likes to anon;
create policy likes_read on public.place_likes for select to anon using(exists(select 1 from public.places p where p.id=place_id and p.status='approved'));
create policy likes_insert on public.place_likes for insert to anon with check(
 visitor_id=nullif(current_setting('request.headers',true)::jsonb->>'x-musubu-visitor','')::uuid
 and exists(select 1 from public.places p where p.id=place_id and p.status='approved')
);
create function public.place_like_counts() returns table(place_id uuid,like_count bigint)
language sql stable security invoker set search_path='' as $$
 select place_id,count(*) from public.place_likes group by place_id;
$$;
revoke all on function public.place_like_counts() from public,anon,authenticated;
grant execute on function public.place_like_counts() to anon;
-- Approval: use the authenticated Supabase Dashboard as project administrator.
-- Set status=approved/rejected and reviewed_at after checking location/content.
-- Browser roles cannot change status, edit/delete places, or read author identifiers.
