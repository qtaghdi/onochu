<script lang="ts">
  import { Music2, X, ExternalLink, Check } from 'lucide-svelte';
  import type { Song } from '$lib/types/song';

  let {
    song,
    index,
    selected = false,
    selectable = false,
    editable = false,
    onSelect = () => {},
    onRemove = () => {}
  }: {
    song: Song | null;
    index: number;
    selected?: boolean;
    selectable?: boolean;
    editable?: boolean;
    onSelect?: () => void;
    onRemove?: () => void;
  } = $props();
</script>

<div class="relative rounded-xl border p-4 transition {selected ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'}">
  <div class="mb-3 flex items-center justify-between">
    <span class="text-xs font-semibold text-zinc-500">추천곡 {index + 1}</span>
    {#if selected}<span class="inline-flex items-center gap-1 text-xs font-semibold"><Check class="size-3.5" />선택됨</span>{/if}
  </div>

  {#if song}
    <div class="flex min-w-0 gap-3">
      {#if song.imageUrl}
        <img class="size-16 shrink-0 rounded-lg object-cover" src={song.imageUrl} alt="" />
      {:else}
        <div class="grid size-16 shrink-0 place-items-center rounded-lg bg-zinc-100"><Music2 class="size-5 text-zinc-400" /></div>
      {/if}
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">{song.title}</p>
        <p class="mt-0.5 truncate text-sm text-zinc-500">{song.artist}</p>
        {#if song.albumName}<p class="mt-0.5 truncate text-xs text-zinc-400">{song.albumName}</p>{/if}
        {#if song.url}
          <a class="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 underline" href={song.url} target="_blank" rel="noreferrer">곡 링크 <ExternalLink class="size-3" /></a>
        {/if}
      </div>
      {#if editable}
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" onclick={onRemove} aria-label={`${index + 1}번 곡 제거`}><X class="size-4" /></button>
      {/if}
    </div>
    {#if selectable}
      <button type="button" class="mt-4 min-h-11 w-full rounded-lg text-sm font-semibold {selected ? 'bg-zinc-900 text-white' : 'border border-zinc-200 hover:bg-zinc-50'}" onclick={onSelect} aria-pressed={selected}>
        {selected ? '이 곡을 선택했어요' : '이 곡 선택'}
      </button>
    {/if}
  {:else}
    <div class="grid min-h-24 place-items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center">
      <div><Music2 class="mx-auto size-5 text-zinc-400" /><p class="mt-2 text-sm text-zinc-500">곡을 추가해 주세요</p></div>
    </div>
  {/if}
</div>
