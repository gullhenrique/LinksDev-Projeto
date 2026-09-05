alter table public.page_views
add column if not exists source text;

alter table public.page_views
add column if not exists device_type text;
