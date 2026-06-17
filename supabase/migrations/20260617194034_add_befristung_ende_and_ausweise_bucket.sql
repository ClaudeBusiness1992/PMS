-- befristung_ende auf mietverhaeltnisse (für gekündigte Mietverhältnisse)
alter table mietverhaeltnisse
  add column if not exists befristung_ende text not null default '';

-- ausweise-Bucket für Ausweisdokumente der Mieter
insert into storage.buckets (id, name, public)
values ('ausweise', 'ausweise', false)
on conflict (id) do nothing;

-- RLS-Policies für ausweise-Bucket
drop policy if exists "User kann eigene Ausweise hochladen" on storage.objects;
drop policy if exists "User kann eigene Ausweise lesen" on storage.objects;

create policy "User kann eigene Ausweise hochladen"
  on storage.objects for insert
  with check (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "User kann eigene Ausweise lesen"
  on storage.objects for select
  using (bucket_id = 'ausweise' and auth.uid()::text = (storage.foldername(name))[1]);
