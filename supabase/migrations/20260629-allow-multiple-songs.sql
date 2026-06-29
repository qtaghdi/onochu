alter table public.song_recommendations
  drop constraint if exists song_recommendations_selected_song_index_check;

alter table public.song_recommendations
  add constraint song_recommendations_selected_song_index_check
  check (selected_song_index is null or selected_song_index >= 0);
