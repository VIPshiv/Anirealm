import { getAnimeFullById, getAnimeEpisodes, JikanAnime, JikanEpisode } from '@/lib/anilist';
import { getStreamingAnime, getStreamingAnimeInfo, getStreamingEpisodes } from '@/app/actions/anime';
import { AnimeEpisode as ConsumetEpisode } from '@/lib/consumet';
import WatchClient from './WatchClient';
import { notFound } from 'next/navigation';

interface StreamInfo {
  id: string;
  title: string;
  image?: string;
  description?: string;
  status?: string;
  releaseDate?: string;
  genres?: string[];
}

export default async function WatchPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ ep?: string, animeId?: string, title?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const id = Number(params.id);
  const epParam = searchParams.ep;
  const initialAnimeId = searchParams.animeId;
  const titleParam = searchParams.title;
  
  const currentEpNum = epParam ? Number(epParam) : 1;

  let anime: JikanAnime | null = null;
  let episodes: JikanEpisode[] = [];
  let animeId: string | null = initialAnimeId || null;
  let availableEpisodes: number[] = [];

  try {
    // 1. Try Jikan (Standard Flow)
    try {
        const [animeRes, episodesRes] = await Promise.all([
          getAnimeFullById(id),
          getAnimeEpisodes(id)
        ]);
        anime = animeRes.data;
        episodes = episodesRes.data;

        // If animeId is missing, try to find it via title
        if (!animeId && anime.title) {
             // Try english title first for better match if available
             const searchTitle = anime.title_english || anime.title;
             const streamRes = await getStreamingAnime(searchTitle);
             if (streamRes.success && streamRes.data.animeId) {
                 animeId = streamRes.data.animeId;
             } else if (anime.title !== searchTitle) {
                  // Fallback to romaji title
                  const streamRes2 = await getStreamingAnime(anime.title);
                  if (streamRes2.success && streamRes2.data.animeId) {
                      animeId = streamRes2.data.animeId;
                  }
             }
        }

        // FETCH STREAMING EPISODES to know which are available
        if (animeId) {
            // Pass title for backup search if primary ID fails to return episodes
            const streamEpsResult = await getStreamingEpisodes(animeId, anime.title_english || anime.title);
            if (streamEpsResult.success && streamEpsResult.data.length > 0) {
               availableEpisodes = streamEpsResult.data.map(e => Number(e.number));
            }
        } else {
            // Try searching directly via backup if no primary ID found at all
            if (anime.title) {
                const backupRes = await getStreamingEpisodes('backup-dummy-id', anime.title_english || anime.title);
                if (backupRes.success && backupRes.data.length > 0) {
                    availableEpisodes = backupRes.data.map(e => Number(e.number));
                }
            }
        }

    } catch {
        // 2. Fallback Flow (Consumet / Custom)
        if (animeId || titleParam) {
            let streamInfo: StreamInfo | null = null;
            let foundAnimeId = animeId;

            if (foundAnimeId) {
                const infoRes = await getStreamingAnimeInfo(foundAnimeId);
                if (infoRes.success) {
                    streamInfo = infoRes.data as unknown as StreamInfo;
                }
            } else if (titleParam) {
                const searchRes = await getStreamingAnime(titleParam);
                if (searchRes.success && searchRes.data.animeId) {
                    foundAnimeId = searchRes.data.animeId;
                    animeId = foundAnimeId;
                    streamInfo = searchRes.data.details as unknown as StreamInfo;
                }
            }
            
            if (streamInfo && foundAnimeId) {
                const info = streamInfo;
                // Construct fake Jikan object
                anime = {
                    mal_id: id,
                    title: info.title,
                    title_english: info.title,
                    images: {
                        jpg: {
                            large_image_url: info.image || '',
                            image_url: info.image || '',
                            small_image_url: ''
                        },
                        webp: {
                            large_image_url: info.image || '',
                            image_url: info.image || '',
                            small_image_url: ''
                        }
                    },
                    synopsis: info.description || 'Description not available.',
                    type: 'TV',
                    status: info.status || 'Unknown',
                    score: 0,
                    year: parseInt(info.releaseDate || '0'),
                    genres: info.genres ? info.genres.map((g: string) => ({ mal_id: 0, type: 'genre', name: g, url: '' })) : [],
                    studios: [],
                    aired: { 
                      string: info.releaseDate || 'Unknown',
                      from: '', to: '', prop: { from: { day: 0, month: 0, year: 0 }, to: { day: 0, month: 0, year: 0 } }
                    },
                    trailer: { 
                      embed_url: '', url: '', youtube_id: '',
                      images: { image_url: '', small_image_url: '', medium_image_url: '', large_image_url: '', maximum_image_url: '' }
                    },
                    title_japanese: '',
                    url: '',
                    approved: true,
                    titles: [],
                    source: 'Original',
                    episodes: 0,
                    airing: false,
                    duration: '',
                    rating: '',
                    season: '',
                    broadcast: { day: '', time: '', timezone: '', string: '' },
                    producers: [],
                    licensors: [],
                    background: '',
                    themes: [],
                    demographics: [],
                    explicit_genres: [],
                    favorites: 0,
                    members: 0,
                    popularity: 0,
                    rank: 0,
                    scored_by: 0
                } as JikanAnime;
                
                const streamEpisodesRes = await getStreamingEpisodes(foundAnimeId);
                if (streamEpisodesRes.success) {
                    episodes = streamEpisodesRes.data.map((ep: ConsumetEpisode) => ({
                        mal_id: ep.number,
                        title: ep.title || `Episode ${ep.number}`,
                        aired: 'Unknown',
                        url: '',
                        title_japanese: '',
                        title_romanji: '',
                        duration: 0,
                        filler: false,
                        recap: false,
                        synopsis: ''
                    })) as JikanEpisode[];
                    
                    availableEpisodes = episodes.map(e => e.mal_id);
                }
            } else {
                notFound();
            }
        } else {
            notFound();
        }
    }
  } catch (error) {
    console.error('Watch Page Data Error:', error);
    notFound();
  }

  if (!anime) return notFound();

  return (
    <WatchClient 
      anime={anime} 
      episodes={episodes} 
      animeId={animeId} 
      currentEpNum={currentEpNum}
      dbId={id}
      availableEpisodes={availableEpisodes}
    />
  );
}
