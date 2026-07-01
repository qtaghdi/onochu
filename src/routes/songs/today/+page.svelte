<script lang="ts">
  import { onMount } from 'svelte';
  import { AlertCircle, CalendarDays, CheckCircle2, LoaderCircle, Music2, RefreshCw, RotateCcw } from 'lucide-svelte';
  import PublicSongCard from '../../../components/songs/public-song-card.svelte';
  import { completeRecommendation, getRecommendation, reopenRecommendation, SONGS_PER_DAY } from '$lib/services/song-recommendation-service';
  import type { SongRecommendation } from '$lib/types/song';
  import { formatDisplayDate, getTodayId } from '$lib/utils/date';

  const today = getTodayId();
  let recommendation = $state<SongRecommendation | null>(null);
  let isLoading = $state(true);
  let updatingIndex = $state<number | null>(null);
  let isReopening = $state(false);
  let errorMessage = $state('');
  const todaysSongs = $derived(recommendation?.songs.slice(0, SONGS_PER_DAY) ?? []);

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error && 'message' in error) return String(error.message);
    return '오늘의 추천곡을 불러오지 못했습니다.';
  }

  async function loadToday() {
    isLoading = true;
    errorMessage = '';
    try {
      recommendation = await getRecommendation(today);
    } catch (error) {
      errorMessage = getErrorMessage(error);
    } finally {
      isLoading = false;
    }
  }

  async function markAsUsed(index: number) {
    if (!recommendation || recommendation.status === 'DONE') return;
    updatingIndex = index;
    errorMessage = '';
    try {
      recommendation = await completeRecommendation(today, index);
    } catch (error) {
      errorMessage = getErrorMessage(error);
    } finally {
      updatingIndex = null;
    }
  }

  async function clearUsedSong() {
    if (!recommendation) return;
    isReopening = true;
    errorMessage = '';
    try {
      recommendation = await reopenRecommendation(today);
    } catch (error) {
      errorMessage = getErrorMessage(error);
    } finally {
      isReopening = false;
    }
  }

  onMount(loadToday);
</script>

<svelte:head>
  <title>오늘의 추천곡</title>
  <meta name="description" content="오늘 인스타 게시글을 위한 추천곡을 확인하세요." />
</svelte:head>

<main class="min-h-screen bg-white">
  <div class="mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
    <div class="flex items-center justify-between border-b border-zinc-950 pb-4">
      <span class="text-sm font-black uppercase tracking-[0.22em]">Onochu</span>
      <button type="button" class="grid size-11 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50" onclick={loadToday} disabled={isLoading} aria-label="추천곡 새로고침"><RefreshCw class="size-4 {isLoading ? 'animate-spin' : ''}" /></button>
    </div>

    <header class="py-10 text-center sm:py-16">
      <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"><CalendarDays class="size-4" />Daily soundtrack</div>
      <h1 class="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-6xl">오늘, 이 노래</h1>
      <p class="mt-4 text-sm font-medium text-zinc-500 sm:text-base">{formatDisplayDate(today)} · 인스타 게시글을 위한 오늘의 플레이리스트</p>
    </header>

    {#if errorMessage}
      <div class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert"><AlertCircle class="mt-0.5 size-4 shrink-0" />{errorMessage}</div>
    {:else if isLoading}
      <div class="grid min-h-72 place-items-center rounded-xl border border-zinc-200"><div class="text-center text-sm text-zinc-500"><LoaderCircle class="mx-auto mb-3 size-6 animate-spin" />추천곡을 불러오는 중이에요.</div></div>
    {:else if !recommendation || todaysSongs.length === 0}
      <div class="grid min-h-72 place-items-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
        <div><Music2 class="mx-auto size-7 text-zinc-400" /><h2 class="mt-3 font-semibold">오늘 등록된 추천곡이 없습니다.</h2><p class="mt-1 text-sm text-zinc-500">추천곡이 등록되면 이곳에서 바로 볼 수 있어요.</p></div>
      </div>
    {:else}
      {#if recommendation.status === 'DONE' && recommendation.selectedSongIndex !== undefined}
        <section class="mb-8 flex flex-col gap-4 rounded-2xl bg-zinc-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-label="오늘 사용한 곡">
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400"><CheckCircle2 class="size-4" />Used today</div>
            <p class="mt-2 text-xl font-bold">{recommendation.songs[recommendation.selectedSongIndex]?.title}</p>
            <p class="mt-1 text-sm text-zinc-400">{recommendation.songs[recommendation.selectedSongIndex]?.artist} · 오늘 사용한 곡</p>
          </div>
          <button type="button" class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 px-4 text-sm font-semibold hover:bg-zinc-900 disabled:opacity-50" onclick={clearUsedSong} disabled={isReopening}>
            {#if isReopening}<LoaderCircle class="mr-2 size-4 animate-spin" />{:else}<RotateCcw class="mr-2 size-4" />{/if}
            선택 취소
          </button>
        </section>
      {/if}

      <div class="mb-7 flex items-end justify-between gap-3 border-b border-zinc-200 pb-4">
        <div><p class="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Selected for today</p><h2 class="mt-1 text-xl font-bold">추천 플레이리스트</h2></div>
        <p class="text-sm font-semibold tabular-nums text-zinc-500">{String(todaysSongs.length).padStart(2, '0')} tracks</p>
      </div>
      <div class="mx-auto grid max-w-3xl grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
        {#each todaysSongs as song, index (`${song.provider}-${song.externalId ?? `${song.title}-${song.artist}`}-${index}`)}
          <PublicSongCard
            {song}
            {index}
            isUsed={recommendation.status === 'DONE' && recommendation.selectedSongIndex === index}
            canMarkUsed={recommendation.status === 'PENDING'}
            isUpdating={updatingIndex === index}
            onMarkUsed={() => markAsUsed(index)}
          />
        {/each}
      </div>
    {/if}
  </div>
</main>
