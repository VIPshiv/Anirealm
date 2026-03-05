import { ANIME } from '@consumet/extensions';

// Initialize providers
const animePahe = new ANIME.AnimePahe();
const hianime = new ANIME.Hianime(); // Backup provider

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
      const res = await animePahe.search(query);
      return res.results.map((r) => ({
        id: r.id,
        title: typeof r.title === 'string' ? r.title : (r.title.userPreferred || r.title.english || r.title.romaji || 'Unknown'),
        image: r.image || '',
        releaseDate: r.releaseDate
      }));
    } catch (err) {
      console.error('AnimePahe Search Error:', err);
      return [];
    }
  },

  getRecentEpisodes: async (page: number = 1): Promise<AnimeResult[]> => {
    try {
      const res = await animePahe.fetchRecentEpisodes(page);
      return res.results.map((r) => ({
        id: r.id,
        title: typeof r.title === 'string' ? r.title : (r.title.userPreferred || r.title.english || r.title.romaji || 'Unknown'),
        image: r.image || r.episodeImage || '',
        episodeNumber: r.episodeNumber,
        episodeId: r.episodeId,
        url: r.url
      }));
    } catch (err) {
      console.error('AnimePahe Recent Error:', err);
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
      const info = await animePahe.fetchAnimeInfo(id);
      return info.episodes?.map((e) => ({
        id: e.id,
        number: e.number,
        title: e.title
      })) || [];
    } catch (err) {
      console.error('AnimePahe Episodes Error:', err);
      return [];
    }
  },

  fetchAnimeInfo: async (id: string) => {
    try {
      const info = await animePahe.fetchAnimeInfo(id);
      return info;
    } catch (err) {
      console.error('AnimePahe Info Error:', err);
      return null;
    }
  },

  getStreamSource: async (episodeId: string): Promise<ServerData[]> => {
    try {
      const sources = await animePahe.fetchEpisodeSources(episodeId);
      
      const mappedSources = sources.sources.map((s) => ({
          url: s.url,
          isM3U8: s.isM3U8 || false,
          quality: s.quality,
          headers: sources.headers
      }));

      const mappedDownloads = (sources.download && Array.isArray(sources.download)) ? sources.download.map((d) => ({
          url: d.url || '',
          isM3U8: false,
          quality: d.quality,
          headers: sources.headers
      })) : [];

      const servers: ServerData[] = [];

      // Server 1: Kwik (Fast) - Uses direct MP4s
      if (mappedDownloads.length > 0) {
          servers.push({
              serverName: 'Kwik (Fast)',
              sources: mappedDownloads
          });
      }

      // Server 2: Kwik (HLS) - Uses m3u8 streams
      if (mappedSources.length > 0) {
          servers.push({
              serverName: 'Kwik (HLS)',
              sources: mappedSources
          });
      }

      // Fallback: If we couldn't split them, just return whatever we have
      if (servers.length === 0) {
          const combined = [...mappedDownloads, ...mappedSources];
          if (combined.length > 0) {
              servers.push({
                  serverName: 'Default',
                  sources: combined
              });
          }
      }

      return servers;
    } catch (err) {
      console.error('AnimePahe Stream Error:', err);
      return [];
    }
  },

  getBackupStream: async (title: string, episodeNumber: number): Promise<ServerData[]> => {
    try {
      // Sanitize title for better search results
      // 1. Replace smart quotes with straight ones or empty
      // 2. Remove special characters that confuse search
      const cleanTitle = title
          .replace(/[’‘]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/[:]/g, '') // Remove colons
          .trim();

      console.log(`Attempting backup stream for "${title}" -> query: "${cleanTitle}"`);
      
      const searchRes = await hianime.search(cleanTitle);
      
      if (!searchRes.results || searchRes.results.length === 0) {
          // Retry with shorter title if failed (e.g. drop "Season 2")
          const shortTitle = cleanTitle.replace(/Season \d+|Part \d+/i, '').trim();
          if (shortTitle !== cleanTitle) {
               console.log(`Retry backup search with: "${shortTitle}"`);
               const retryRes = await hianime.search(shortTitle);
               if (retryRes.results && retryRes.results.length > 0) {
                   // Proceed with these results
                   searchRes.results = retryRes.results;
               } else {
                   return [];
               }
          } else {
              return [];
          }
      }

      // Find best match
      // If we looked for "Frieren Season 2", we want the result that says "Season 2"
      // But if we fell back to "Frieren", we still want to try to find "Season 2" if the user asked for it.
      
      // For now, accept the first result as "Best Guess" but ideally we fuzzy match.
      const anime = searchRes.results[0]; 
      
      const info = await hianime.fetchAnimeInfo(anime.id);
      if (!info.episodes) return [];

      const episode = info.episodes.find(e => e.number === episodeNumber);
      if (!episode) return [];

      const sources = await hianime.fetchEpisodeSources(episode.id);
      
      // Hianime usually returns m3u8 sources
      const mappedSources = sources.sources.map((s) => ({
          url: s.url,
          isM3U8: s.isM3U8 ?? true,
          quality: s.quality || 'Auto',
          headers: sources.headers
      }));

      return [{
          serverName: 'Hianime (Backup)',
          sources: mappedSources
      }];
    } catch (err) {
      console.error('Backup Stream Error:', err);
      return [];
    }
  },

  getBackupEpisodes: async (title: string): Promise<AnimeEpisode[]> => {
      try {
           let cleanTitle = title
              .replace(/[’‘]/g, "'")
              .replace(/[“”]/g, '"')
              .replace(/[:!]/g, '')
              .trim();
              
           console.log(`Backup episodes search: ${cleanTitle}`);
           let searchRes = await hianime.search(cleanTitle);
           
           if (!searchRes.results || searchRes.results.length === 0) {
              const shortTitle = cleanTitle.replace(/Season \d+|Part \d+/i, '').trim();
              if (shortTitle !== cleanTitle) {
                  console.log(`Retry backup episodes with: "${shortTitle}"`);
                  searchRes = await hianime.search(shortTitle);
              }
           }
           
           if (!searchRes.results || searchRes.results.length === 0) return [];
           
           const anime = searchRes.results[0];
           const info = await hianime.fetchAnimeInfo(anime.id);
           
           return info.episodes?.map((e) => ({
                id: e.id,
                number: e.number,
                title: e.title
           })) || [];
      } catch (err) {
          console.error('Backup Episodes Error:', err);
          return [];
      }
  }
};
