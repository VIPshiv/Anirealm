'use server';

import { animeProvider, AnimeResult, AnimeEpisode, ServerData } from '@/lib/consumet';
import { z } from 'zod';

export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

const SearchSchema = z.string().min(1).max(100);
const IdSchema = z.string().min(1);

export async function getStreamingAnime(title: string): Promise<ActionResult<{ animeId: string; details: AnimeResult }>> {
  try {
    const titleResult = SearchSchema.safeParse(title);
    if (!titleResult.success) return { success: false, error: 'Invalid title format' };
    
    const results = await animeProvider.search(titleResult.data);
    if (!results?.length) return { success: false, error: 'No results found' };

    const normalizedQuery = titleResult.data.toLowerCase();
    const match = results.find(r => r.title.toLowerCase() === normalizedQuery) 
               || results.find(r => r.title.toLowerCase().includes(normalizedQuery))
               || results.find(r => normalizedQuery.includes(r.title.toLowerCase()))
               || results[0];
    
    if (match) return { success: true, data: { animeId: match.id, details: match } };
    return { success: false, error: 'No matching anime found' };
  } catch (error) {
    console.error('Failed to get streaming info:', error);
    return { success: false, error: 'Failed to fetch streaming information' };
  }
}

export async function getStreamingEpisodes(animeId: string, title?: string): Promise<ActionResult<AnimeEpisode[]>> {
  try {
    void title;
    const idResult = IdSchema.safeParse(animeId);
    if (!idResult.success) return { success: false, error: 'Invalid Anime ID' };
    
    const episodes = await animeProvider.getEpisodes(idResult.data);
    
    return { success: true, data: episodes };
  } catch (error) {
    console.error('Failed to get episodes:', error);
    return { success: false, error: 'Failed to fetch episodes' };
  }
}

export async function getStreamingSource(animeId: string, episodeNum: string): Promise<ActionResult<ServerData[]>> {
  try {
    const idResult = IdSchema.safeParse(animeId);
    if (!idResult.success) return { success: false, error: 'Invalid Anime ID' };

    const episodes = await animeProvider.getEpisodes(idResult.data);
    const requestedNum = Number(episodeNum);
    let episode = episodes.find(e => e.number === requestedNum);

    // Fallback: if provider numbers are offset (e.g., season continues), map by index
    if (!episode && episodes.length > 0 && requestedNum > 0) {
      const numbers = episodes.map(e => e.number).filter(n => Number.isFinite(n));
      const minNum = numbers.length > 0 ? Math.min(...numbers) : 1;
      const offsetNum = minNum + requestedNum - 1;
      episode = episodes.find(e => e.number === offsetNum) || episodes[requestedNum - 1] || episodes[0];
    }
    
    if (!episode) return { success: false, error: 'Episode not found' };
    
    const sources = await animeProvider.getStreamSource(episode.id);
    return { success: true, data: sources };
  } catch (error) {
    console.error('Failed to get sources:', error);
    return { success: false, error: 'Failed to fetch streaming sources' };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStreamingAnimeInfo(animeId: string): Promise<ActionResult<any>> {
  try {
    const idResult = IdSchema.safeParse(animeId);
    if (!idResult.success) return { success: false, error: 'Invalid Anime ID' };

    const info = await animeProvider.fetchAnimeInfo(idResult.data);
    return { success: true, data: info };
  } catch (error) {
    console.error('Failed to get anime info:', error);
    return { success: false, error: 'Failed to fetch anime info' };
  }
}

export async function searchStreamingAnime(query: string): Promise<ActionResult<AnimeResult[]>> {
    try {
        const queryResult = SearchSchema.safeParse(query);
        if (!queryResult.success) return { success: false, error: 'Invalid search query' };
        
        const results = await animeProvider.search(queryResult.data);
        return { success: true, data: results };
    } catch (error) {
        console.error('Failed to search:', error);
        return { success: false, error: 'Search failed' };
    }
}

export async function getRecentStreamingEpisodes(): Promise<ActionResult<AnimeResult[]>> {
    try {
        const results = await animeProvider.getRecentEpisodes();
        return { success: true, data: results };
    } catch (error) {
        console.error('Failed to get recent episodes:', error);
        return { success: false, error: 'Failed to fetch recent episodes' };
    }
}
