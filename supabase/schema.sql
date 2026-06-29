create table if not exists public.song_recommendations (
  id text primary key,
  date text not null,
  songs jsonb not null,
  status text not null default 'PENDING',
  selected_song_index int,
  completed_at text,
  updated_at text,
  constraint song_recommendations_status_check check (status in ('PENDING', 'DONE')),
  constraint song_recommendations_selected_song_index_check check (
    selected_song_index is null or selected_song_index >= 0
  )
);

alter table public.song_recommendations
  drop constraint if exists song_recommendations_selected_song_index_check;

alter table public.song_recommendations
  add constraint song_recommendations_selected_song_index_check
  check (selected_song_index is null or selected_song_index >= 0);

alter table public.song_recommendations enable row level security;

create policy "Public can read song recommendations"
on public.song_recommendations for select
to anon, authenticated
using (true);

create policy "Public can insert song recommendations"
on public.song_recommendations for insert
to anon, authenticated
with check (true);

create policy "Public can update song recommendations"
on public.song_recommendations for update
to anon, authenticated
using (true)
with check (true);
