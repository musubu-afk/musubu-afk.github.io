-- Applied as place_pin_colors_original_addresses; existing RLS remains in force.
alter table public.places add column pin_color text check(pin_color in ('blue','green','orange','pink','purple','red')), add column address_original text not null default '' check(char_length(address_original)<=300);
alter table public.place_edits add column pin_color text check(pin_color in ('blue','green','orange','pink','purple','red')), add column address_original text not null default '' check(char_length(address_original)<=300);
grant select(pin_color,address_original),insert(pin_color,address_original) on public.places to anon;
grant select(pin_color,address_original),insert(pin_color,address_original) on public.place_edits to anon;
