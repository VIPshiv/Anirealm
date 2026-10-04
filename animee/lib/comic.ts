const COMIC_API_BASE = 'https://www.sankavollerei.web.id';

export interface ComicResult {
  slug: string;
  title: string;
  image?: string;
  type?: string;
  status?: string;
}

export interface ComicChapter {
  slug: string;
  title: string;
  number?: number;
  images: string[];
}

interface ComicEnvelope<T> { data?: T; }

async function fetchComicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${COMIC_API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error(`Comic API ${response.status} for ${path}`);
  const payload = await response.json() as ComicEnvelope<T>;
  if (payload.data === undefined) throw new Error(`Comic API returned no data for ${path}`);
  return payload.data;
}

export async function searchComics(query: string): Promise<ComicResult[]> {
  const data = await fetchComicApi<ComicResult[] | { comics?: ComicResult[] }>(`/comic/search?q=${encodeURIComponent(query)}`);
  return Array.isArray(data) ? data : data.comics || [];
}

export async function getComicDetails(slug: string): Promise<unknown> {
  return fetchComicApi(`/comic/comic/${encodeURIComponent(slug)}`);
}

export async function getComicChapter(slug: string): Promise<ComicChapter> {
  return fetchComicApi(`/comic/chapter/${encodeURIComponent(slug)}`);
}

export async function getLatestComics(): Promise<ComicResult[]> {
  const data = await fetchComicApi<ComicResult[] | { comics?: ComicResult[] }>('/comic/latest');
  return Array.isArray(data) ? data : data.comics || [];
}