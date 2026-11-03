-- Applied remotely as allow_resident_business_categories.
-- Only extend allowed categories. Existing RLS and approval defaults are unchanged.
alter table public.places drop constraint places_category_check;
alter table public.places add constraint places_category_check
 check (category in ('scenery','walk','photo','rest','local','other','meal','dessert','gift','stay'));
