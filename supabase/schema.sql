create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '',
  bio text not null default '',
  role text not null default '',
  location text not null default '',
  avatar_url text not null default '',
  show_bio boolean not null default true,
  show_role boolean not null default true,
  show_location boolean not null default false,
  accent_color text not null default '#6ef5a8',
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  url text not null check (url ~ '^https?://'),
  position integer not null default 0,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.links enable row level security;

create policy "Perfis públicos podem ser vistos" on public.profiles for select using (true);
create policy "Usuário cria o próprio perfil" on public.profiles for insert with check (auth.uid() = id);
create policy "Usuário edita o próprio perfil" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Links visíveis são públicos" on public.links for select using (is_visible or auth.uid() = profile_id);
create policy "Usuário cria os próprios links" on public.links for insert with check (auth.uid() = profile_id);
create policy "Usuário edita os próprios links" on public.links for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Usuário exclui os próprios links" on public.links for delete using (auth.uid() = profile_id);

create index if not exists links_profile_position_idx on public.links(profile_id, position);
