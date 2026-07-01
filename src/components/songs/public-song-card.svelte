<script lang="ts">
  import { Check, ExternalLink, LoaderCircle, Music2, RotateCcw } from 'lucide-svelte';
  import type { Song } from '$lib/types/song';

  let {
    song,
    index,
    isUsed = false,
    isUpdating = false,
    onToggleUsed = () => {}
  }: {
    song: Song;
    index: number;
    isUsed?: boolean;
    isUpdating?: boolean;
    onToggleUsed?: () => void;
  } = $props();
</script>

<article class="group min-w-0 rounded-3xl border p-3 transition sm:p-4 {isUsed ? 'border-emerald-300 bg-emerald-50/50' : 'border-zinc-200 bg-white'}" aria-label={`${index + 1}번째 추천곡 ${song.title}`}>
  <div class="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
    {#if song.imageUrl}
      <img class="size-full object-cover" src={song.imageUrl} alt={`${song.title} 앨범 커버`} loading="lazy" />
    {:else}
      <div class="grid size-full place-items-center bg-zinc-100">
        <div class="text-center text-zinc-400"><Music2 class="mx-auto size-10" /><span class="mt-3 block text-xs font-semibold uppercase tracking-[0.2em]">Onochu pick</span></div>
      </div>
    {/if}

    <span class="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
    {#if isUsed}<span class="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm"><Check class="size-3" />사용 완료</span>{/if}
  </div>

  <div class="pt-4">
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-base font-bold tracking-tight sm:text-lg">{song.title}</h3>
        <p class="mt-1 truncate text-sm text-zinc-600">{song.artist}</p>
        {#if song.albumName}<p class="mt-1 truncate text-xs text-zinc-400">{song.albumName}</p>{/if}
      </div>
      {#if song.url}
        <a class="grid size-11 shrink-0 place-items-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950" href={song.url} target="_blank" rel="noreferrer" aria-label={`${song.title} 음악 페이지 열기`}><ExternalLink class="size-4" /></a>
      {/if}
    </div>
    <button
      type="button"
      class="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition {isUsed ? 'border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50' : 'bg-zinc-950 text-white hover:bg-zinc-800'} disabled:opacity-60"
      onclick={onToggleUsed}
      disabled={isUpdating}
      aria-pressed={isUsed}
    >
      {#if isUpdating}<LoaderCircle class="mr-2 size-4 animate-spin" />{:else if isUsed}<RotateCcw class="mr-2 size-4" />{:else}<Check class="mr-2 size-4" />{/if}
      {isUsed ? '사용 취소' : '사용 완료로 표시'}
    </button>
  </div>
</article>
