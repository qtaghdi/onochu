import type { Song } from '$lib/types/song';

type ItunesResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

type ItunesResponse = { results?: ItunesResult[] };

export async function searchItunes(query: string, signal?: AbortSignal): Promise<Song[]> {
  const term = query.trim();
  if (!term) return [];

  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', term);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('country', 'KR');
  url.searchParams.set('limit', '20');

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('iTunes 검색 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.');

  const data = (await response.json()) as ItunesResponse;
  return (data.results ?? [])
    .filter((item): item is ItunesResult & { trackName: string; artistName: string } => Boolean(item.trackName && item.artistName))
    .map((item) => ({
      title: item.trackName,
      artist: item.artistName,
      albumName: item.collectionName,
      imageUrl: item.artworkUrl100?.replace('100x100bb', '300x300bb'),
      url: item.trackViewUrl,
      externalId: item.trackId?.toString(),
      provider: 'itunes' as const
    }));
}
