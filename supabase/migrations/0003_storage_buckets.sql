insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);
insert into storage.buckets (id, name, public) values ('source-files', 'source-files', true);

create policy "thumbnails are publicly readable" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "authenticated users can upload own thumbnails" on storage.objects for insert with check (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "authenticated users can update own thumbnails" on storage.objects for update using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "authenticated users can delete own thumbnails" on storage.objects for delete using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "source files are publicly readable" on storage.objects for select using (bucket_id = 'source-files');
create policy "authenticated users can upload own source files" on storage.objects for insert with check (bucket_id = 'source-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "authenticated users can update own source files" on storage.objects for update using (bucket_id = 'source-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "authenticated users can delete own source files" on storage.objects for delete using (bucket_id = 'source-files' and (storage.foldername(name))[1] = auth.uid()::text);
