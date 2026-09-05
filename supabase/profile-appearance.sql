alter table public.profiles
add column if not exists background_color text not null default '#0b0d11';

alter table public.profiles
add column if not exists background_secondary text not null default '#17231d';

alter table public.profiles
add column if not exists background_style text not null default 'theme';

alter table public.profiles
add column if not exists font_family text not null default 'modern';

alter table public.profiles
add column if not exists button_radius integer not null default 18;
