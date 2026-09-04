alter table public.link_clicks
add column if not exists link_title text;

alter table public.link_clicks
add column if not exists link_url text;
