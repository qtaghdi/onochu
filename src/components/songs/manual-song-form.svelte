<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import type { Song } from '$lib/types/song';

  let { onAdd, disabled = false }: { onAdd: (song: Song) => void; disabled?: boolean } = $props();

  let title = $state('');
  let artist = $state('');
  let url = $state('');

  function add() {
    if (!title.trim() || !artist.trim() || disabled) return;
    onAdd({
      title: title.trim(),
      artist: artist.trim(),
      url: url.trim() || undefined,
      provider: 'manual'
    });
    title = '';
    artist = '';
    url = '';
  }
</script>

<section class="border-t border-zinc-200 pt-6" aria-labelledby="manual-heading">
  <div class="mb-4">
    <h2 id="manual-heading" class="text-base font-semibold">직접 입력</h2>
    <p class="mt-1 text-sm text-zinc-500">검색되지 않는 곡도 직접 추가할 수 있어요.</p>
  </div>

  <div class="space-y-3">
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium">곡 제목</span>
      <input class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50" placeholder="곡 제목" bind:value={title} disabled={disabled} />
    </label>
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium">아티스트</span>
      <input class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50" placeholder="아티스트" bind:value={artist} disabled={disabled} />
    </label>
    <label class="block">
      <span class="mb-1.5 block text-sm font-medium">URL <span class="font-normal text-zinc-400">(선택)</span></span>
      <input class="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50" type="url" placeholder="https://" bind:value={url} disabled={disabled} />
    </label>
    <button type="button" class="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50" onclick={add} disabled={!title.trim() || !artist.trim() || disabled}><Plus class="mr-1 size-4" />추천 목록에 추가</button>
  </div>
</section>
