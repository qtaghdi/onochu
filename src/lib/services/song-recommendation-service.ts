import type { Song, SongRecommendation } from '$lib/types/song';
import { supabase, supabaseConfigurationError } from './supabase';

export const SONGS_PER_DAY = 2;

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
  const selectedSongIndex = row.selected_song_index ?? undefined;
  const hasValidSelection = selectedSongIndex !== undefined && selectedSongIndex < SONGS_PER_DAY && selectedSongIndex < row.songs.length;

  return {
    id: row.id,
    date: row.date,
    songs: row.songs,
    status: row.status === 'DONE' && hasValidSelection ? 'DONE' : 'PENDING',
    selectedSongIndex: hasValidSelection ? selectedSongIndex : undefined,
    completedAt: hasValidSelection ? (row.completed_at ?? undefined) : undefined,
    updatedAt: row.updated_at ?? undefined
  };
}

export async function getRecommendation(date: string): Promise<SongRecommendation | null> {
  const client = getClient();
  const { data, error } = await client
    .from('song_recommendations')
    .select('*')
    .eq('id', date)
    .maybeSingle<SongRecommendationRow>();

  if (error) throw error;
  if (data) return mapRow(data);

  const { data: previous, error: previousError } = await client
    .from('song_recommendations')
    .select('*')
    .lt('date', date)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle<SongRecommendationRow>();

  if (previousError) throw previousError;
  if (!previous) return null;

  const queuedSongs = previous.songs.slice(SONGS_PER_DAY);
  if (queuedSongs.length === 0) return null;

  return saveRecommendation(date, queuedSongs);
}

export async function saveRecommendation(date: string, songs: Song[]): Promise<SongRecommendation> {
  if (songs.length === 0) throw new Error('추천곡을 한 곡 이상 추가해 주세요.');

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
