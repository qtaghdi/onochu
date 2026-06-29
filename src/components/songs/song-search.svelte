<script lang="ts">
  import { Search, LoaderCircle, Music2, ExternalLink } from 'lucide-svelte';
  import { searchItunes } from '$lib/services/itunes-service';
  import type { Song } from '$lib/types/song';

  let { onAdd, disabled = false }: { onAdd: (song: Song) => void; disabled?: boolean } = $props();

  let query = $state('');
  let results = $state<Song[]>([]);
  let isSearching = $state(false);
  let hasSearched = $state(false);
  let errorMessage = $state('');
  let controller: AbortController | null = null;

  async function handleSearch(event: SubmitEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term || disabled) return;

    controller?.abort();
    controller = new AbortController();
    isSearching = true;
    hasSearched = true;
    errorMessage = '';

    try {
      results = await searchItunes(term, controller.signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      results = [];
      errorMessage = error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.';
    } finally {
      isSearching = false;
    }
  }
</script>

<section aria-labelledby="search-heading">
  <div class="mb-4">
    <h2 id="search-heading" class="text-base font-semibold">노래 검색</h2>
    <p class="mt-1 text-sm text-zinc-500">iTunes에서 곡을 찾아 추천 슬롯에 담아보세요.</p>
  </div>

  <form class="flex gap-2" onsubmit={handleSearch}>
    <label class="relative min-w-0 flex-1">
      <span class="sr-only">노래 제목 또는 아티스트 검색</span>
      <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        class="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
        placeholder="노래 제목 또는 아티스트 검색"
        bind:value={query}
        disabled={disabled}
      />
    </label>
    <button
      type="submit"
      class="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:bg-zinc-300"
      disabled={!query.trim() || isSearching || disabled}
    >
      {#if isSearching}<LoaderCircle class="mr-2 size-4 animate-spin" />{/if}
      검색
    </button>
  </form>

  <div class="mt-4" aria-live="polite">
    {#if isSearching}
      <div class="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500">
        <LoaderCircle class="mr-2 size-4 animate-spin" /> 검색 중이에요
      </div>
    {:else if errorMessage}
      <p class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{errorMessage}</p>
    {:else if hasSearched && results.length === 0}
      <div class="rounded-xl border border-dashed border-zinc-200 p-6 text-center">
        <Music2 class="mx-auto size-6 text-zinc-400" />
        <p class="mt-2 text-sm text-zinc-600">검색 결과가 없습니다.</p>
      </div>
    {:else if results.length > 0}
      <ul class="max-h-[30rem] space-y-2 overflow-y-auto pr-1">
        {#each results as song, index (`${song.externalId}-${index}`)}
          <li class="rounded-xl border border-zinc-200 p-3">
            <div class="flex min-w-0 items-center gap-3">
              {#if song.imageUrl}
                <img class="size-14 shrink-0 rounded-lg object-cover" src={song.imageUrl} alt="" loading="lazy" />
              {:else}
                <div class="grid size-14 shrink-0 place-items-center rounded-lg bg-zinc-100"><Music2 class="size-5 text-zinc-400" /></div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{song.title}</p>
                <p class="truncate text-xs text-zinc-500">{song.artist}{song.albumName ? ` · ${song.albumName}` : ''}</p>
                {#if song.url}
                  <a class="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 underline" href={song.url} target="_blank" rel="noreferrer">
                    iTunes <ExternalLink class="size-3" />
                  </a>
                {/if}
              </div>
            </div>
            <button type="button" class="mt-3 min-h-11 w-full rounded-lg border border-zinc-200 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50" onclick={() => onAdd(song)} disabled={disabled}>추천 목록에 추가</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
