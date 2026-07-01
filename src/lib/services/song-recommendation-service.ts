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

// Keep the existing integer column compatible: 0/1 means one used song, 2 means both.
function decodeUsedSongIndexes(value: number | null, songCount: number): number[] {
  if (value === 2) return [0, 1].filter((index) => index < songCount);
  if (value === 0 || value === 1) return value < songCount ? [value] : [];
  return [];
}

function encodeUsedSongIndexes(indexes: number[]): number | null {
  if (indexes.includes(0) && indexes.includes(1)) return 2;
  return indexes[0] ?? null;
}

function mapRow(row: SongRecommendationRow): SongRecommendation {
  const dailySongCount = Math.min(row.songs.length, SONGS_PER_DAY);
  const usedSongIndexes = decodeUsedSongIndexes(row.selected_song_index, dailySongCount);
  const isComplete = dailySongCount > 0 && usedSongIndexes.length === dailySongCount;

  return {
    id: row.id,
    date: row.date,
    songs: row.songs,
    status: isComplete ? 'DONE' : 'PENDING',
    usedSongIndexes,
    completedAt: isComplete ? (row.completed_at ?? undefined) : undefined,
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

export async function updateRecommendationUsage(date: string, usedSongIndexes: number[], dailySongCount: number): Promise<SongRecommendation> {
  const normalizedIndexes = [...new Set(usedSongIndexes)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < dailySongCount)
    .sort();
  const isComplete = dailySongCount > 0 && normalizedIndexes.length === dailySongCount;
  const now = new Date().toISOString();
  const { data, error } = await getClient()
    .from('song_recommendations')
    .update({
      status: isComplete ? 'DONE' : 'PENDING',
      selected_song_index: encodeUsedSongIndexes(normalizedIndexes),
      completed_at: isComplete ? now : null,
      updated_at: now
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
