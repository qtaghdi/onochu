import type { Song, SongRecommendation } from '$lib/types/song';
import { supabase, supabaseConfigurationError } from './supabase';

type SongRecommendationRow = {
  id: string;
  date: string;
  songs: Song[];
  status: 'PENDING' | 'DONE';
  selected_song_index: number | null;
  completed_at: string | null;
  updated_at: string | null;
};

function getClient() {
  if (!supabase) throw new Error(supabaseConfigurationError ?? 'Supabase 연결을 초기화하지 못했습니다.');
  return supabase;
}

function mapRow(row: SongRecommendationRow): SongRecommendation {
  return {
    id: row.id,
    date: row.date,
    songs: row.songs,
    status: row.status ?? 'PENDING',
    selectedSongIndex: row.selected_song_index ?? undefined,
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

export async function getRecommendation(date: string): Promise<SongRecommendation | null> {
  const { data, error } = await getClient()
    .from('song_recommendations')
    .select('*')
    .eq('id', date)
    .maybeSingle<SongRecommendationRow>();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function saveRecommendation(date: string, songs: Song[]): Promise<SongRecommendation> {
  const payload = {
    id: date,
    date,
    songs,
    status: 'PENDING' as const,
    selected_song_index: null,
    completed_at: null,
    updated_at: new Date().toISOString()
  };
  const { data, error } = await getClient()
    .from('song_recommendations')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single<SongRecommendationRow>();

  if (error) throw error;
  return mapRow(data);
}

export async function completeRecommendation(date: string, selectedSongIndex: number): Promise<SongRecommendation> {
  const { data, error } = await getClient()
    .from('song_recommendations')
    .update({
      status: 'DONE',
      selected_song_index: selectedSongIndex,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', date)
    .select()
    .single<SongRecommendationRow>();

  if (error) throw error;
  return mapRow(data);
}

export async function reopenRecommendation(date: string): Promise<SongRecommendation> {
  const { data, error } = await getClient()
    .from('song_recommendations')
    .update({
      status: 'PENDING',
      selected_song_index: null,
      completed_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', date)
    .select()
    .single<SongRecommendationRow>();

  if (error) throw error;
  return mapRow(data);
}
