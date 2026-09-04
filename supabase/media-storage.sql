alter table public.profiles
add column if not exists banner_url text not null default '';

alter table public.profiles
add column if not exists instagram_handle text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Imagens de perfil são públicas" on storage.objects;
drop policy if exists "Usuário envia suas imagens" on storage.objects;
drop policy if exists "Usuário atualiza suas imagens" on storage.objects;
drop policy if exists "Usuário exclui suas imagens" on storage.objects;

create policy "Imagens de perfil são públicas"
on storage.objects for select
using (bucket_id = 'profile-media');

create policy "Usuário envia suas imagens"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Usuário atualiza suas imagens"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Usuário exclui suas imagens"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
