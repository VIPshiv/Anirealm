
export interface SuwayomiManga {
  id: number;
  sourceId: string;
  title: string;
  artist?: string;
  author?: string;
  description?: string;
  genre?: string[];
  status?: string;
  thumbnailUrl: string;
  url: string;
  isFavorite: boolean;
  realUrl?: string;
  categories?: number[];
  chaptersCount?: number;
}

export interface SuwayomiChapter {
  id: number;
  mangaId: number;
  url: string;
  name: string;
  uploadDate: number;
  chapterNumber: number;
  scanlator?: string;
  read: boolean;
  index: number;
  pageCount?: number;
  chapterCount?: number;
}

export interface SuwayomiPage {
  url: string;
  index: number;
}

export interface SuwayomiCategory {
  id: number;
  name: string;
  order: number;
}

export interface SuwayomiSource {
  id: string;
  name: string;
  lang: string;
  iconUrl: string;
  supportsLatest: boolean;
  isConfigurable: boolean;
}

export interface SuwayomiExtension {
  pkgName: string;
  name: string;
  version: string;
  lang: string;
  isNsfw: boolean;
  installed: boolean;
  hasUpdate: boolean;
  obsolete: boolean;
  iconUrl: string;
}

export interface SuwayomiDownload {
  id: number;
  mangaId: number;
  chapterId: number;
  status: string; // "DOWNLOADED", "DOWNLOADING", "QUEUE", "ERROR"
  progress: number;
}

const BASE_URL = '/api/suwayomi';
const GRAPHQL_URL = '/api/suwayomi-graphql';

async function graphqlRequest<T>(query: string, variables: any = {}): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  // Add default headers to mimic a browser request
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    }
  };

  const res = await fetch(url, finalOptions);
  const contentType = res.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    // If we get HTML/Text, it's likely a 404, server error, or Cloudflare protection
    const text = await res.text();
    if (text.includes("Cloudflare")) {
      throw new Error("Cloudflare protection active");
    }
    throw new Error(`Expected JSON from ${url} but got ${contentType}. Status: ${res.status}`);
  }
  if (!res.ok) {
     throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- 1. Health / Basic ---
export async function getPing(): Promise<boolean> {
  try {
    await fetchJson(`${BASE_URL}/ping`);
    return true;
  } catch {
    return false;
  }
}

export async function getVersion(): Promise<{ version: string }> {
  return fetchJson(`${BASE_URL}/version`);
}

// --- 2. Library ---
export async function getLibrary(): Promise<SuwayomiManga[]> {
  try {
    // 1. Fetch all categories
    const categories = await fetchJson<SuwayomiCategory[]>(`${BASE_URL}/category`);
    
    // 2. Fetch manga for each category
    const promises = categories.map(cat => 
      fetchJson<SuwayomiManga[]>(`${BASE_URL}/category/${cat.id}`).catch(() => [])
    );
    
    const results = await Promise.all(promises);
    
    // 3. Flatten and deduplicate
    const allManga = results.flat();
    // Ensure IDs are numbers to prevent duplicate keys in React (e.g. "123" vs 123)
    const uniqueManga = Array.from(new Map(allManga.map(m => {
      const id = Number(m.id);
      return [id, { ...m, id }];
    })).values());
    
    return uniqueManga;

  } catch (error) {
    console.error('[Suwayomi] Error fetching library:', error);
    return [];
  }
}

export async function getLibraryManga(libraryId: number): Promise<SuwayomiManga> {
  return fetchJson(`${BASE_URL}/library/${libraryId}`);
}

export async function addMangaToLibrary(sourceId: string, mangaUrl: string, title?: string): Promise<number> {
  // Use GraphQL to add manga since REST endpoint is unreliable
  if (!title) {
    // Fallback or error if title is missing (required for search-based import)
    console.warn("Title is required for GraphQL import. Attempting without it might fail.");
    throw new Error("Title is required to add manga to library");
  }

  try {
    // 1. Find the manga ID using fetchSourceManga (Search by title)
    // We use the title to search because we can't search by URL directly in this API version
    const searchData = await graphqlRequest<{ fetchSourceManga: { mangas: { id: number, url: string }[] } }>(`
      mutation SearchManga($sourceId: LongString!, $query: String!) {
        fetchSourceManga(input: { source: $sourceId, query: $query, type: SEARCH, page: 1 }) {
          mangas {
            id
            url
          }
        }
      }
    `, { sourceId, query: title });

    // 2. Find the exact match by URL
    const match = searchData.fetchSourceManga.mangas.find(m => m.url === mangaUrl);
    
    if (!match) {
      throw new Error(`Manga not found in source search results for title: ${title}`);
    }

    // 3. Add to library (Update inLibrary = true)
    await graphqlRequest(`
      mutation AddToLibrary($id: Int!) {
        updateManga(input: { id: $id, patch: { inLibrary: true } }) {
          manga { id inLibrary }
        }
      }
    `, { id: match.id });

    return match.id;

  } catch (error) {
    console.error("Failed to add manga via GraphQL:", error);
    throw error;
  }
}

export async function removeMangaFromLibrary(libraryId: number): Promise<void> {
  await graphqlRequest(`
    mutation RemoveFromLibrary($id: Int!) {
      updateManga(input: { id: $id, patch: { inLibrary: false } }) {
        manga { id inLibrary }
      }
    }
  `, { id: libraryId });
}

// --- 3. Sources ---
export async function getSources(): Promise<SuwayomiSource[]> {
  // Try /source/list first (standard), fallback to /sources if needed
  try {
    return await fetchJson(`${BASE_URL}/source/list`);
  } catch {
    return fetchJson(`${BASE_URL}/sources`);
  }
}

export async function getSource(sourceId: string): Promise<SuwayomiSource> {
  return fetchJson(`${BASE_URL}/source/${sourceId}`);
}

export async function searchSource(sourceId: string, query: string, page = 1): Promise<SuwayomiManga[]> {
  try {
    // Tachidesk uses 'query' parameter, not 'q'
    const res = await fetchJson<any>(`${BASE_URL}/source/${sourceId}/search?query=${encodeURIComponent(query)}&page=${page}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.mangaList)) return res.mangaList;
    return [];
  } catch (e: any) {
    if (e.message === "Cloudflare protection active") {
      console.warn(`Search skipped for source ${sourceId}: Cloudflare protection active.`);
    } else {
      console.warn(`Search failed for source ${sourceId}:`, e);
    }
    return [];
  }
}

export async function getPopularManga(sourceId: string, page = 1): Promise<SuwayomiManga[]> {
  try {
    const res = await fetchJson<any>(`${BASE_URL}/source/${sourceId}/popular/${page}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.mangaList)) return res.mangaList;
    return [];
  } catch (e) {
    console.warn(`Popular manga failed for source ${sourceId}, trying latest...`, e);
    // Fallback to latest if popular fails
    try {
      const res = await fetchJson<any>(`${BASE_URL}/source/${sourceId}/latest/${page}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.mangaList)) return res.mangaList;
      return [];
    } catch (e2) {
      console.warn(`Latest manga failed for source ${sourceId}:`, e2);
      return [];
    }
  }
}

export async function getLatestManga(sourceId: string, page = 1): Promise<SuwayomiManga[]> {
  try {
    const res = await fetchJson<any>(`${BASE_URL}/source/${sourceId}/latest/${page}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.mangaList)) return res.mangaList;
    return [];
  } catch (e) {
    console.warn(`Latest manga failed for source ${sourceId}:`, e);
    return [];
  }
}

export async function getMangaFromSource(sourceId: string, sourceMangaId: string): Promise<SuwayomiManga> {
  return fetchJson(`${BASE_URL}/source/${sourceId}/manga/${sourceMangaId}`);
}

// --- 4. Manga ---
export async function getMangaDetails(id: number): Promise<SuwayomiManga> {
  return fetchJson(`${BASE_URL}/manga/${id}`);
}


export function getMangaIconUrl(id: number): string {
  return `${BASE_URL}/manga/${id}/thumbnail`;
}

// --- 5. Chapters ---
export async function getChapters(mangaId: number): Promise<SuwayomiChapter[]> {
  return fetchJson(`${BASE_URL}/manga/${mangaId}/chapters`);
}

export async function getChapter(mangaId: number, chapterId: number): Promise<SuwayomiChapter> {
  return fetchJson(`${BASE_URL}/manga/${mangaId}/chapter/${chapterId}`);
}

export async function markChapterRead(mangaId: number, chapterId: number): Promise<void> {
  await fetchJson(`${BASE_URL}/manga/${mangaId}/chapter/${chapterId}/read`, { method: 'POST' });
}

export async function markChapterUnread(mangaId: number, chapterId: number): Promise<void> {
  await fetchJson(`${BASE_URL}/manga/${mangaId}/chapter/${chapterId}/unread`, { method: 'POST' });
}

// --- 6. Pages ---
export async function getChapterPages(mangaId: number, chapterId: number): Promise<string[]> {
  // Fetch chapter details to get page count
  const chapter = await fetchJson<SuwayomiChapter>(`${BASE_URL}/manga/${mangaId}/chapter/${chapterId}`);
  const pageCount = chapter.pageCount || 0;

  // Generate URLs for each page
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(`${BASE_URL}/manga/${mangaId}/chapter/${chapterId}/page/${i}`);
  }
  
  return pages;
}

export function getChapterPageUrl(mangaId: number, chapterId: number, pageIndex: number): string {
    return `${BASE_URL}/manga/${mangaId}/chapter/${chapterId}/page/${pageIndex}`;
}

// --- 7. Downloads ---
export async function getDownloads(): Promise<SuwayomiDownload[]> {
  // Try /download (queue) first, fallback to /downloads
  try {
    return await fetchJson(`${BASE_URL}/download`);
  } catch {
    return fetchJson(`${BASE_URL}/downloads`);
  }
}

export async function addDownload(mangaId: number, chapterId: number): Promise<void> {
  await fetchJson(`${BASE_URL}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mangaId, chapterId })
  });
}

export async function removeDownload(downloadId: number): Promise<void> {
  await fetchJson(`${BASE_URL}/download/${downloadId}`, { method: 'DELETE' });
}

// --- 8. Extensions ---
export async function getExtensions(): Promise<SuwayomiExtension[]> {
  try {
    return await fetchJson(`${BASE_URL}/extension/list`);
  } catch {
    return fetchJson(`${BASE_URL}/extensions`);
  }
}

export async function installExtension(pkgName: string): Promise<void> {
  await fetchJson(`${BASE_URL}/extension/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pkgName })
  });
}

export async function updateExtensions(): Promise<void> {
  await fetchJson(`${BASE_URL}/extension/update`, { method: 'POST' });
}

export async function removeExtension(pkgName: string): Promise<void> {
  await fetchJson(`${BASE_URL}/extension/${pkgName}`, { method: 'DELETE' });
}

export async function getExtensionRepos(): Promise<string[]> {
  return fetchJson(`${BASE_URL}/extension/repo`);
}

export async function addExtensionRepo(repoUrl: string): Promise<void> {
  await fetchJson(`${BASE_URL}/extension/repo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl })
  });
}

// --- 9. System ---
export async function getSettings(): Promise<any> {
  try {
    return await fetchJson(`${BASE_URL}/settings`);
  } catch {
    console.warn('Settings endpoint not found or failed');
    return {};
  }
}

export async function updateSettings(settings: any): Promise<void> {
  await fetchJson(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
}

export async function getCategories(): Promise<SuwayomiCategory[]> {
  return fetchJson(`${BASE_URL}/category`);
}

// Helper to filter for "Manhwa" if genre contains it
export function isManhwa(manga: SuwayomiManga): boolean {
    if (manga.genre?.some(g => g.toLowerCase().includes('manhwa'))) return true;
    return false;
}