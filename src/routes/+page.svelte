<script lang="ts">
  import { base } from '$app/paths';
</script>

<svelte:head><title>오늘의 추천곡</title></svelte:head>

<main class="grid min-h-screen place-items-center p-6">
  <div class="w-full max-w-sm space-y-3">
    <a class="flex min-h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white" href={`${base}/songs/today`}>오늘의 추천곡 보기</a>
    <a class="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold" href={`${base}/songs/manage`}>추천곡 관리</a>
  </div>
</main>
