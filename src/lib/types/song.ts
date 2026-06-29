export type SongProvider = 'itunes' | 'manual';

export type Song = {
  title: string;
  artist: string;
  url?: string;
  albumName?: string;
  imageUrl?: string;
  externalId?: string;
  provider: SongProvider;
};

export type SongRecommendationStatus = 'PENDING' | 'DONE';

export type SongRecommendation = {
  id: string;
  date: string;
  songs: Song[];
  status: SongRecommendationStatus;
  selectedSongIndex?: number;
  completedAt?: string;
  updatedAt?: string;
};
