alter table public.links
add column if not exists link_type text not null default 'url';

alter table public.links
add column if not exists action_value text not null default '';

alter table public.links
add column if not exists group_name text not null default '';

alter table public.links
add column if not exists display_mode text not null default 'button';
