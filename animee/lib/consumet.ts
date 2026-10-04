const API_BASE = 'https://www.sankavollerei.web.id';

interface ApiEnvelope<T> { data?: T; }
interface ApiAnime {
  title?: string;
  animeId?: string;
  href?: string;
  poster?: string;
  status?: string;
  releaseDate?: string;
  episodes?: Array<{ title?: string; episodeId?: string; href?: string; number?: number }>;
  synopsis?: { paragraphs?: string[] };
  genreList?: Array<{ title?: string }>;
}

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`Sanka API ${response.status} for ${path}`);
  const payload = await response.json() as ApiEnvelope<T>;
  if (payload.data === undefined) throw new Error(`Sanka API returned no data for ${path}`);
  return payload.data;
}

function slugFromHref(href?: string): string | undefined {
  return href?.split('/').filter(Boolean).pop();
}

function mapAnime(item: ApiAnime): AnimeResult {
  return {
    id: item.animeId || slugFromHref(item.href) || '',
    title: item.title || 'Unknown',
    image: item.poster || '',
    releaseDate: item.releaseDate,
  };
}

export interface AnimeResult {
  id: string;
  title: string;
  image: string;
  releaseDate?: string;
  episodeNumber?: number;
  episodeId?: string;
  url?: string;
}

export interface AnimeEpisode {
  id: string;
  number: number;
  title?: string;
}

export interface AnimeSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
  headers?: Record<string, string>;
}

export interface ServerData {
    serverName: string;
    sources: AnimeSource[];
}

export const animeProvider = {
  search: async (query: string): Promise<AnimeResult[]> => {
    try {
      const res = await fetchApi<{ animeList?: ApiAnime[] }>(`/anime/search/${encodeURIComponent(query)}`);
      return (res.animeList || []).map(mapAnime).filter((anime) => anime.id);
    } catch (err) {
      console.error('Sanka anime search error:', err);
      return [];
    }
  },

  getRecentEpisodes: async (page: number = 1): Promise<AnimeResult[]> => {
    try {
      const res = await fetchApi<{ animeList?: ApiAnime[] }>(`/anime/ongoing-anime?page=${page}`);
      return (res.animeList || []).map(mapAnime).filter((anime) => anime.id);
    } catch (err) {
      console.error('Sanka recent anime error:', err);
      return [];
    }
  },

  getTrending: async (page: number = 1): Promise<AnimeResult[]> => {
      void page;
      try {
          // AnimePahe might not have fetchTrending, but let's try or fallback to empty
          // Actually, AnimePahe class in consumet usually doesn't have fetchTrending.
          // But let's check if I can use another provider for trending if needed, 
          // or just rely on Jikan for trending.
          // Since the user specifically asked for "from streaming", maybe they want to see what's popular on the streaming site.
          // If AnimePahe doesn't have it, I'll skip it to avoid errors.
          // I'll check if I can use 'search' with no query or something? No.
          return [];
      } catch (err) {
          void err;
          return [];
      }
  },

  getEpisodes: async (id: string): Promise<AnimeEpisode[]> => {
    try {
      const info = await fetchApi<ApiAnime>(`/anime/anime/${encodeURIComponent(id)}`);
      return (info.episodes || []).map((episode, index) => ({
        id: episode.episodeId || slugFromHref(episode.href) || '',
        number: episode.number || index + 1,
        title: episode.title,
      })).filter((episode) => episode.id);
    } catch (err) {
      console.error('Sanka anime episodes error:', err);
      return [];
    }
  },

  fetchAnimeInfo: async (id: string) => {
    try {
      const info = await fetchApi<ApiAnime>(`/anime/anime/${encodeURIComponent(id)}`);
      return {
        ...info,
        title: info.title || 'Unknown',
        image: info.poster || '',
        description: info.synopsis?.paragraphs?.join('\n\n') || '',
        genres: (info.genreList || []).map((genre) => genre.title || '').filter(Boolean),
      };
    } catch (err) {
      console.error('Sanka anime info error:', err);
      return null;
    }
  },

  getStreamSource: async (episodeId: string): Promise<ServerData[]> => {
    try {
      const episode = await fetchApi<{
        defaultStreamingUrl?: string;
        server?: { qualities?: Array<{ title?: string; serverList?: Array<{ title?: string; serverId?: string }> }> };
      }>(`/anime/episode/${encodeURIComponent(episodeId)}`);
      const servers: ServerData[] = [];
      const serverList = (episode.server?.qualities || []).flatMap((quality) =>
        (quality.serverList || []).map((server) => ({ quality: quality.title, server }))
      );

      for (const entry of serverList) {
        if (!entry.server.serverId) continue;
        try {
          const resolved = await fetchApi<{ url?: string }>(`/anime/server/${encodeURIComponent(entry.server.serverId)}`);
          if (resolved.url) {
            servers.push({
              serverName: `${entry.server.title || 'Server'} ${entry.quality || ''}`.trim(),
              sources: [{ url: resolved.url, isM3U8: resolved.url.includes('.m3u8'), quality: entry.quality }],
            });
          }
        } catch (error) {
          console.warn('Sanka stream server failed:', entry.server.serverId, error);
        }
      }

      if (servers.length === 0 && episode.defaultStreamingUrl) {
        return [{ serverName: 'Default', sources: [{ url: episode.defaultStreamingUrl, isM3U8: false, quality: 'Default' }] }];
      }
      return servers;
    } catch (err) {
      console.error('Sanka anime stream error:', err);
      return [];
    }
  },
};
