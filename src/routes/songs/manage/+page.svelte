<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { AlertCircle, CalendarDays, ExternalLink, LoaderCircle, RefreshCw, Save } from 'lucide-svelte';
  import ManualSongForm from '../../../components/songs/manual-song-form.svelte';
  import SongSearch from '../../../components/songs/song-search.svelte';
  import SongSlot from '../../../components/songs/song-slot.svelte';
  import {
    getRecommendation,
    saveRecommendation,
    SONGS_PER_DAY
  } from '$lib/services/song-recommendation-service';
  import type { Song, SongRecommendation } from '$lib/types/song';
  import { formatDisplayDate, getTodayId } from '$lib/utils/date';

  const today = getTodayId();
  let recommendation = $state<SongRecommendation | null>(null);
  let draftSongs = $state<Song[]>([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  const queuedSongCount = $derived(Math.max(0, draftSongs.length - SONGS_PER_DAY));
  const canSave = $derived(draftSongs.length > 0 && !isSaving);

  function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error && 'message' in error) return String(error.message);
    return fallback;
  }

  async function loadToday() {
    isLoading = true;
    errorMessage = '';
    successMessage = '';
    try {
      recommendation = await getRecommendation(today);
      draftSongs = recommendation ? [...recommendation.songs] : [];
    } catch (error) {
      errorMessage = getErrorMessage(error, '오늘의 추천곡을 불러오지 못했습니다.');
    } finally {
      isLoading = false;
    }
  }

  function addSong(song: Song) {
    const alreadyAdded = draftSongs.some((item) =>
      song.externalId
        ? item.provider === song.provider && item.externalId === song.externalId
        : item.title === song.title && item.artist === song.artist
    );
    if (alreadyAdded) {
      errorMessage = '이미 추천 목록에 있는 곡입니다.';
      successMessage = '';
      return;
    }
    draftSongs = [...draftSongs, song];
    successMessage = `“${song.title}”을(를) 추천 목록에 추가했습니다.`;
    errorMessage = '';
  }

  function removeSong(index: number) {
    draftSongs = draftSongs.filter((_, songIndex) => songIndex !== index);
    successMessage = '';
  }

  async function handleSave() {
    if (!canSave) return;
    isSaving = true;
    errorMessage = '';
    successMessage = '';
    try {
      recommendation = await saveRecommendation(today, draftSongs);
      successMessage = `추천곡 ${draftSongs.length}개를 저장했습니다.`;
    } catch (error) {
      errorMessage = getErrorMessage(error, '추천곡 저장에 실패했습니다.');
    } finally {
      isSaving = false;
    }
  }

  onMount(loadToday);
</script>

<svelte:head>
  <title>추천곡 관리</title>
  <meta name="description" content="오늘의 인스타 추천곡 목록을 관리하세요." />
</svelte:head>

<main class="min-h-screen bg-white">
  <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
    <header class="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500"><CalendarDays class="size-4" />{formatDisplayDate(today)}</div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">오늘의 추천곡 관리</h1>
        <p class="mt-2 text-sm text-zinc-500">오늘은 앞의 2곡을 사용하고, 나머지는 다음 날 대기열로 이어집니다.</p>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:flex">
        <a class="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50" href={`${base}/songs/today`}><ExternalLink class="mr-2 size-4" />공개 화면</a>
        <button type="button" class="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50" onclick={loadToday} disabled={isLoading}><RefreshCw class="mr-2 size-4 {isLoading ? 'animate-spin' : ''}" />새로고침</button>
      </div>
    </header>

    {#if errorMessage}<div class="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><AlertCircle class="mt-0.5 size-4 shrink-0" />{errorMessage}</div>{/if}
    {#if successMessage}<div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{successMessage}</div>{/if}

    {#if isLoading}
      <div class="grid min-h-72 place-items-center rounded-xl border border-zinc-200"><div class="text-center text-sm text-zinc-500"><LoaderCircle class="mx-auto mb-3 size-6 animate-spin" />추천곡을 불러오는 중이에요.</div></div>
    {:else}
      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)]">
        <div class="rounded-xl border border-zinc-200 p-4 sm:p-6">
          <SongSearch onAdd={addSong} />
          <div class="mt-6"><ManualSongForm onAdd={addSong} /></div>
        </div>

        <aside class="rounded-xl border border-zinc-200 p-4 sm:p-6 lg:sticky lg:top-6">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div><h2 class="text-base font-semibold">추천 목록</h2><p class="mt-1 text-sm text-zinc-500">오늘 {Math.min(draftSongs.length, SONGS_PER_DAY)}곡 · 대기 {queuedSongCount}곡</p></div>
          </div>

          {#if recommendation && recommendation.usedSongIndexes.length > 0}
            <p class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">현재 공개 화면에 사용한 곡이 표시되어 있습니다. 이 목록을 다시 저장하면 사용 기록이 초기화됩니다.</p>
          {/if}

          {#if draftSongs.length === 0}
            <p class="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">아직 추가한 추천곡이 없습니다.</p>
          {:else}
            <div class="space-y-3">
              {#each draftSongs as song, index (`${song.provider}-${song.externalId ?? `${song.title}-${song.artist}`}-${index}`)}
                {#if index === SONGS_PER_DAY}<p class="pt-2 text-xs font-semibold text-zinc-500">내일부터 순서대로 사용</p>{/if}
                <SongSlot {song} {index} editable onRemove={() => removeSong(index)} />
              {/each}
            </div>
          {/if}

          <button type="button" class="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:bg-zinc-300" onclick={handleSave} disabled={!canSave}>
            {#if isSaving}<LoaderCircle class="mr-2 size-4 animate-spin" />{:else}<Save class="mr-2 size-4" />{/if}
            {isSaving ? '저장 중' : `추천곡 ${draftSongs.length}개 저장`}
          </button>
          {#if draftSongs.length === 0}<p class="mt-2 text-center text-xs text-zinc-500">한 곡 이상 추가하면 저장할 수 있어요.</p>{/if}
        </aside>
      </div>
    {/if}
  </div>
</main>
