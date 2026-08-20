create table if not exists public.site_content (
  id integer primary key default 1 check (id = 1),
  logo text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "Public can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "Public can create site content"
  on public.site_content for insert
  to anon, authenticated
  with check (true);

create policy "Public can update site content"
  on public.site_content for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Public can upload media"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'aos-media');

create policy "Public can read media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'aos-media');

create policy "Public can delete media"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'aos-media');