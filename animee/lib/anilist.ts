
const BASE_URL = 'https://graphql.anilist.co';

// --- Types (Mapped to match existing Jikan interfaces where possible) ---

export interface JikanImage {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface JikanResource {
  mal_id: number; // We will map AniList ID here for compatibility
  url: string;
  images: JikanImage;
  title: string;
  title_english: string;
  title_japanese: string;
  type: string;
  status: string;
  score: number;
  scored_by: number; // AniList: popularity or meanScore count?
  rank: number; // AniList: averageScore or popularity rank
  popularity: number;
  members: number; // AniList: popularity (users who have it on list)
  favorites: number;
  synopsis: string;
  background: string;
  genres: { mal_id: number; type: string; name: string; url: string }[];
  explicit_genres: { mal_id: number; type: string; name: string; url: string }[];
  themes: { mal_id: number; type: string; name: string; url: string }[];
  demographics: { mal_id: number; type: string; name: string; url: string }[];
}

export interface JikanAnime extends JikanResource {
  episodes: number;
  airing: boolean;
  aired: {
    from: string;
    to: string;
    prop: {
      from: { day: number; month: number; year: number };
      to: { day: number; month: number; year: number };
    };
    string: string;
  };
  duration: string;
  rating: string;
  source: string;
  studios: { mal_id: number; type: string; name: string; url: string }[];
  year: number;
  season?: string;
  broadcast?: {
    day: string;
    time: string;
    timezone: string;
    string: string;
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
      image_url: string;
      small_image_url: string;
      medium_image_url: string;
      large_image_url: string;
      maximum_image_url: string;
    };
  };
}

export interface JikanManga extends JikanResource {
  chapters: number;
  volumes: number;
  publishing: boolean;
  published: {
    from: string;
    to: string;
    prop: {
      from: { day: number; month: number; year: number };
      to: { day: number; month: number; year: number };
    };
    string: string;
  };
  authors: { mal_id: number; type: string; name: string; url: string }[];
  serializations: { mal_id: number; type: string; name: string; url: string }[];
}

export interface JikanResponse<T> {
  data: T;
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface JikanEpisode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  title_romanji: string;
  duration: number;
  aired: string;
  filler: boolean;
  recap: boolean;
  synopsis: string;
}

// ... Additional types as needed ...
export interface JikanCharacter {
    character: {
        mal_id: number;
        url: string;
        images: JikanImage;
        name: string;
    };
    role: string;
    favorites: number;
}
  
export interface JikanStaff {
    person: {
        mal_id: number;
        url: string;
        images: JikanImage;
        name: string;
    };
    positions: string[];
}

export interface JikanRecommendation {
    entry: {
      mal_id: number;
      url: string;
      images: JikanImage;
      title: string;
    };
    url: string;
    votes: number;
}
  
export interface JikanReview {
    mal_id: number;
    url: string;
    type: string;
    reactions: {
        overall: number;
        nice: number;
        love_it: number;
        funny: number;
        confusing: number;
        informative: number;
        well_written: number;
        creative: number;
    };
    date: string;
    review: string;
    score: number;
    tags: string[];
    is_spoiler: boolean;
    is_preliminary: boolean;
    user: {
        url: string;
        username: string;
        images: JikanImage;
    };
}

export interface TopAnimeParams {
type?: string;
filter?: string;
rating?: string;
sfw?: boolean;
page?: number;
limit?: number;
}

export interface AnimeSearchParams {
    q?: string;
    page?: number;
    limit?: number;
    type?: string;
    score?: number;
    min_score?: number;
    max_score?: number;
    status?: string;
    rating?: string;
    sfw?: boolean;
    genres?: string;
    genres_exclude?: string;
    order_by?: string;
    sort?: string;
    letter?: string;
    producers?: string;
    start_date?: string;
    end_date?: string;
}

export interface SeasonParams {
    filter?: string;
    sfw?: boolean;
    unapproved?: boolean;
    page?: number;
    limit?: number;
}

// --- Helper: Mappers ---

interface AniListImage {
    extraLarge: string;
    large: string;
    medium: string;
}

interface AniListDate {
    year: number;
    month: number;
    day: number;
}

interface AniListStudio {
    id: number;
    name: string;
    siteUrl: string;
}

interface AniListTrailer {
    id: string;
    site: string;
}

interface AniListMedia {
    id: number;
    idMal?: number;
    title: {
        romaji: string;
        english: string;
        native: string;
    };
    coverImage: AniListImage;
    startDate: AniListDate;
    endDate: AniListDate;
    description: string;
    season: string;
    seasonYear: number;
    type: string;
    format: string;
    status: string;
    episodes: number;
    duration: number;
    chapters: number;
    volumes: number;
    genres: string[];
    isAdult: boolean;
    averageScore: number;
    popularity: number;
    favourites: number;
    source: string;
    siteUrl: string;
    trailer: AniListTrailer;
    studios: {
        nodes: AniListStudio[];
    };
    streamingEpisodes?: {
        title: string;
        thumbnail: string;
        url: string;
        site: string;
    }[];
}

function mapImage(coverImage: AniListImage): JikanImage {
    const url = coverImage?.extraLarge || coverImage?.large || coverImage?.medium || '';
    return {
        jpg: { image_url: url, small_image_url: coverImage?.medium || url, large_image_url: coverImage?.extraLarge || url },
        webp: { image_url: url, small_image_url: coverImage?.medium || url, large_image_url: coverImage?.extraLarge || url },
    };
}

function mapDate(date: AniListDate) {
    if (!date || !date.year) return { from: '', to: '', prop: { from: { day: 0, month: 0, year: 0 }, to: { day: 0, month: 0, year: 0 } }, string: 'Unknown' };
    const dateStr = `${date.year}-${date.month || 1}-${date.day || 1}`;
    return {
        from: dateStr,
        to: '',
        prop: { from: { day: date.day, month: date.month, year: date.year }, to: { day: 0, month: 0, year: 0 } },
        string: dateStr
    };
}

function mapAnime(media: AniListMedia): JikanAnime {
    return {
        mal_id: media.id, // Using AniList ID
        url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
        images: mapImage(media.coverImage),
        title: media.title?.romaji || media.title?.english || media.title?.native || 'Unknown',
        title_english: media.title?.english || media.title?.romaji || '',
        title_japanese: media.title?.native || '',
        type: media.format || 'TV',
        status: media.status || 'FINISHED',
        score: (media.averageScore || 0) / 10, // Scale 0-100 to 0-10
        scored_by: media.popularity || 0,
        rank: media.averageScore || 0,
        popularity: media.popularity || 0,
        members: media.popularity || 0,
        favorites: media.favourites || 0,
        synopsis: media.description ? media.description.replace(/\(Source:.*?\)|\[Source:.*?\]/g, '').trim() : '',
        background: '',
        genres: (media.genres || []).map((g: string) => ({ mal_id: 0, type: 'genre', name: g, url: '' })),
        explicit_genres: [],
        themes: [],
        demographics: [],
        episodes: media.episodes || 0,
        airing: media.status === 'RELEASING',
        aired: mapDate(media.startDate),
        duration: media.duration ? `${media.duration} min` : 'Unknown',
        rating: media.isAdult ? 'R+ - Mild Nudity' : 'PG-13',
        source: media.source || 'Original',
        studios: (media.studios?.nodes || []).map((s: AniListStudio) => ({ mal_id: s.id, type: 'studio', name: s.name, url: s.siteUrl })),
        year: media.startDate?.year || 0,
        season: media.season,
        broadcast: { day: '', time: '', timezone: '', string: '' },
        trailer: {
            youtube_id: media.trailer?.id || '',
            url: media.trailer ? `https://www.youtube.com/watch?v=${media.trailer.id}` : '',
            embed_url: media.trailer ? `https://www.youtube.com/embed/${media.trailer.id}` : '',
            images: { image_url: '', small_image_url: '', medium_image_url: '', large_image_url: '', maximum_image_url: '' }
        }
    };
}

// --- Execute Query ---

async function fetchAniList(query: string, variables: Record<string, unknown> = {}, retries = 3): Promise<any> {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            const text = await response.text();
            // 429 is Rate Limit - we should definitely retry after a backoff
            if (response.status === 429 && retries > 0) {
                 const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
                 await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                 return fetchAniList(query, variables, retries - 1);
            }
            throw new Error(`AniList API Error: ${response.status} - ${text}`);
        }

        return response.json();
    } catch (error) {
        if (retries > 0) {
             console.warn(`Fetch failed, retrying... (${retries} attempts left)`);
             await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
             return fetchAniList(query, variables, retries - 1);
        }
        throw error;
    }
}

// --- Specific Functions ---

const MEDIA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
  }
  startDate {
    year
    month
    day
  }
  endDate {
    year
    month
    day
  }
  description
  season
  seasonYear
  type
  format
  status
  episodes
  duration
  chapters
  volumes
  genres
  isAdult
  averageScore
  popularity
  favourites
  source
  siteUrl
  trailer {
    id
    site
  }
  studios(isMain: true) {
    nodes {
      id
      name
      siteUrl
    }
  }
`;

export async function getTopAnime(params: TopAnimeParams | number = 1): Promise<JikanResponse<JikanAnime[]>> {
    const page = typeof params === 'number' ? params : (params.page || 1);
    
    let args = 'type: ANIME, sort: SCORE_DESC, isAdult: false';
    if (typeof params === 'object' && params.filter) {
        if (params.filter === 'airing') {
            args = 'type: ANIME, sort: POPULARITY_DESC, status: RELEASING, isAdult: false';
        } else if (params.filter === 'upcoming') {
            args = 'type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED, isAdult: false';
        } else if (params.filter === 'bypopularity') {
            args = 'type: ANIME, sort: POPULARITY_DESC, isAdult: false';
        } else if (params.filter === 'favorite') {
            args = 'type: ANIME, sort: FAVOURITES_DESC, isAdult: false';
        }
        // Add more filters as needed
    }

    const query = `
    query ($page: Int) {
        Page (page: $page, perPage: 25) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
            }
            media (${args}) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;

    const data = await fetchAniList(query, { page });
    return {
        data: data.data.Page.media.map(mapAnime),
        pagination: {
            last_visible_page: data.data.Page.pageInfo.lastPage,
            has_next_page: data.data.Page.pageInfo.hasNextPage,
            current_page: data.data.Page.pageInfo.currentPage,
            items: { count: 25, total: data.data.Page.pageInfo.total, per_page: 25 }
        }
    };
}

export async function getAnimeFullById(id: number): Promise<{ data: JikanAnime }> {
    const query = `
    query ($id: Int) {
        Media (id: $id, type: ANIME) {
            ${MEDIA_FRAGMENT}
            recommendations(perPage: 10, sort: RATING_DESC) {
               nodes {
                   mediaRecommendation {
                       id
                       title { romaji }
                       coverImage { large }
                   }
               }
            }
        }
    }
    `;
    const data = await fetchAniList(query, { id });
    return { data: mapAnime(data.data.Media) };
}

// Reuse for getAnimeById
export const getAnimeById = getAnimeFullById;

export async function searchAnime(params: AnimeSearchParams | string): Promise<JikanResponse<JikanAnime[]>> {
    const variables: Record<string, unknown> = { page: 1, perPage: 20 };
    if (typeof params === 'string') {
        variables.search = params;
    } else {
        variables.search = params.q;
        variables.page = params.page || 1;
        if (params.limit) variables.perPage = params.limit;
        // Map other params if needed
    }

    const query = `
    query ($page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
            }
            media (type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;

    const data = await fetchAniList(query, variables);
    const perPage = (variables.perPage as number) || 20;
    return {
        data: data.data.Page.media.map(mapAnime),
        pagination: {
            last_visible_page: data.data.Page.pageInfo.lastPage,
            has_next_page: data.data.Page.pageInfo.hasNextPage,
            current_page: data.data.Page.pageInfo.currentPage,
            items: { count: perPage, total: data.data.Page.pageInfo.total, per_page: perPage }
        }
    };
}

export async function getSeasonNow(params: SeasonParams | number = 1): Promise<JikanResponse<JikanAnime[]>> {
    const page = typeof params === 'number' ? params : (params.page || 1);
    
    // Determine current season roughly
    const month = new Date().getMonth() + 1;
    let season = 'WINTER';
    if (month >= 3 && month <= 5) season = 'SPRING';
    else if (month >= 6 && month <= 8) season = 'SUMMER';
    else if (month >= 9 && month <= 11) season = 'FALL';
    
    const year = new Date().getFullYear();

    const query = `
    query ($page: Int, $season: MediaSeason, $year: Int) {
        Page (page: $page, perPage: 25) {
            pageInfo { hasNextPage, lastPage, currentPage, total }
            media (type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;

    const data = await fetchAniList(query, { page, season, year });
    return {
        data: data.data.Page.media.map(mapAnime),
        pagination: {
             last_visible_page: data.data.Page.pageInfo.lastPage,
             has_next_page: data.data.Page.pageInfo.hasNextPage,
             current_page: data.data.Page.pageInfo.currentPage,
             items: { count: 25, total: data.data.Page.pageInfo.total, per_page: 25 }
        }
    };
}

export async function getSeasonUpcoming(page = 1): Promise<JikanResponse<JikanAnime[]>> {
    // Determine next season
    const month = new Date().getMonth() + 1;
    let season = 'SPRING';
    let year = new Date().getFullYear();
    
    if (month >= 12 || month <= 2) season = 'SPRING';
    else if (month >= 3 && month <= 5) season = 'SUMMER';
    else if (month >= 6 && month <= 8) season = 'FALL';
    else { season = 'WINTER'; year++; }

    const query = `
    query ($page: Int, $season: MediaSeason, $year: Int) {
        Page (page: $page, perPage: 25) {
             pageInfo { hasNextPage, lastPage, currentPage, total }
             media (type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
                 ${MEDIA_FRAGMENT}
             }
        }
    }
    `;

    const data = await fetchAniList(query, { page, season, year });
    return {
        data: data.data.Page.media.map(mapAnime),
        pagination: {
             last_visible_page: data.data.Page.pageInfo.lastPage,
             has_next_page: data.data.Page.pageInfo.hasNextPage,
             current_page: data.data.Page.pageInfo.currentPage,
             items: { count: 25, total: data.data.Page.pageInfo.total, per_page: 25 }
        }
    };
}

export async function getAnimeEpisodes(id: number, page = 1): Promise<JikanResponse<JikanEpisode[]>> {
    const query = `
    query ($id: Int) {
        Media (id: $id) {
            streamingEpisodes {
                title
                thumbnail
                url
                site
            }
            episodes
        }
    }
    `;
    
    // Use page variable to prevent unused error, though logic may not use it effectively yet
    void page;
    
    const data = await fetchAniList(query, { id });
    const media = data.data.Media;
    const episodes: JikanEpisode[] = (media.streamingEpisodes || []).map((ep: { url: string; title: string }, index: number) => ({
        mal_id: index + 1,
        url: ep.url,
        title: ep.title,
        title_japanese: '',
        title_romanji: '',
        duration: 0,
        aired: '',
        filler: false,
        recap: false,
        synopsis: ''
    }));

    // If no streaming episodes but we know the count, generate dummy
    if (episodes.length === 0 && media.episodes) {
        for (let i = 1; i <= media.episodes; i++) {
            episodes.push({
                mal_id: i,
                url: '',
                title: `Episode ${i}`,
                title_japanese: '',
                title_romanji: '',
                duration: 0,
                aired: '',
                filler: false,
                recap: false,
                synopsis: ''
            });
        }
    }

    return {
        data: episodes,
        pagination: {
            last_visible_page: 1,
            has_next_page: false,
            current_page: 1,
            items: { count: episodes.length, total: episodes.length, per_page: 100 }
        }
    };
}

export async function getAnimeCharacters(id: number): Promise<{ data: JikanCharacter[] }> {
    const query = `
    query ($id: Int) {
        Media(id: $id) {
            characters(sort: ROLE, perPage: 20) {
                edges {
                    role
                    node {
                        id
                        name { full }
                        image { large }
                        siteUrl
                    }
                }
            }
        }
    }
    `;
    const data = await fetchAniList(query, { id });
    interface CharacterEdge {
        role: string;
        node: {
            id: number;
            name: { full: string };
            image: { large: string };
            siteUrl: string;
        };
    }

    const chars = data.data.Media.characters.edges.map((edge: CharacterEdge) => ({
        character: {
            mal_id: edge.node.id,
            url: edge.node.siteUrl,
            images: { jpg: { image_url: edge.node.image.large, small_image_url: '', large_image_url: '' }, webp: { image_url: '', small_image_url: '', large_image_url: '' } },
            name: edge.node.name.full
        },
        role: edge.role,
        favorites: 0
    }));
    return { data: chars };
}

export async function getAnimeStaff(id: number): Promise<{ data: JikanStaff[] }> {
    const query = `
    query ($id: Int) {
        Media(id: $id) {
            staff(sort: RELEVANCE, perPage: 10) {
                edges {
                    role
                    node {
                        id
                        name { full }
                        image { large }
                        siteUrl
                    }
                }
            }
        }
    }
    `;
    const data = await fetchAniList(query, { id });
    interface StaffEdge {
        role: string;
        node: {
            id: number;
            name: { full: string };
            image: { large: string };
            siteUrl: string;
        };
    }
    const staff = data.data.Media.staff.edges.map((edge: StaffEdge) => ({
        person: {
            mal_id: edge.node.id,
            url: edge.node.siteUrl,
            images: { jpg: { image_url: edge.node.image.large, small_image_url: '', large_image_url: '' }, webp: { image_url: '', small_image_url: '', large_image_url: '' } },
            name: edge.node.name.full
        },
        positions: [edge.role]
    }));
    return { data: staff };
}


export async function getAnimeRecommendations(id: number): Promise<{ data: JikanRecommendation[] }> {
    const query = `
    query ($id: Int) {
        Media(id: $id) {
            recommendations(perPage: 10, sort: RATING_DESC) {
               nodes {
                   mediaRecommendation {
                       id
                       title { romaji }
                       coverImage { large }
                       siteUrl
                   }
               }
            }
        }
    }
    `;
    const data = await fetchAniList(query, { id });
    interface RecNode {
        mediaRecommendation?: {
            id: number;
            siteUrl: string;
            coverImage: AniListImage;
            title: { romaji: string };
        };
    }
    const recs = data.data.Media.recommendations.nodes.map((node: RecNode) => {
        if (!node.mediaRecommendation) return null;
        return {
            entry: {
                mal_id: node.mediaRecommendation.id,
                url: node.mediaRecommendation.siteUrl,
                images: mapImage(node.mediaRecommendation.coverImage),
                title: node.mediaRecommendation.title.romaji
            },
            url: '',
            votes: 0
        };
    }).filter(Boolean);
    return { data: recs };
}

export async function getTopManga(page = 1): Promise<JikanResponse<JikanManga[]>> {
    const query = `
    query ($page: Int) {
        Page (page: $page, perPage: 25) {
            pageInfo { hasNextPage, lastPage, currentPage, total }
            media (type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;

    const data = await fetchAniList(query, { page });
    // Using mapAnime but casting as any or JikanManga, works for list views usually
    return {
        data: data.data.Page.media.map((m: AniListMedia) => mapAnime(m)) as unknown as JikanManga[], 
        pagination: {
            last_visible_page: data.data.Page.pageInfo.lastPage,
            has_next_page: data.data.Page.pageInfo.hasNextPage,
            current_page: data.data.Page.pageInfo.currentPage,
            items: { count: 25, total: data.data.Page.pageInfo.total, per_page: 25 }
        }
    };
}

export async function searchManga(params: AnimeSearchParams | string, page = 1): Promise<JikanResponse<JikanManga[]>> {
    const variables: Record<string, unknown> = { page, perPage: 20 };
    if (typeof params === 'string') {
        variables.search = params;
    } else {
        variables.search = params.q;
        variables.page = params.page || page;
    }

    const query = `
    query ($page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
            }
            media (type: MANGA, search: $search, sort: SEARCH_MATCH, isAdult: false) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;

    const data = await fetchAniList(query, variables);
    return {
        data: data.data.Page.media.map((m: AniListMedia) => mapAnime(m)) as unknown as JikanManga[], 
        pagination: {
            last_visible_page: data.data.Page.pageInfo.lastPage,
            has_next_page: data.data.Page.pageInfo.hasNextPage,
            current_page: data.data.Page.pageInfo.currentPage,
            items: { count: 20, total: data.data.Page.pageInfo.total, per_page: 20 }
        }
    };
}

export async function getSchedules(filter?: string): Promise<JikanResponse<JikanAnime[]>> {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = filter?.toLowerCase() || days[new Date().getDay()];
    
    // Calculate start/end of the day (approximate 0-24h window for the requested day relative to now)
    // We try to find the "current week's" day.
    const now = new Date();
    const currentDayIndex = now.getDay();
    const targetDayIndex = days.indexOf(dayName);
    
    const diff = targetDayIndex - currentDayIndex;
    // If looking for a day that passed this week (e.g. looking for Mon on Wed), show this week's Mon (-2 days)
    // If looking for a day to come (e.g. looking for Fri on Wed), show this week's Fri (+2 days)
    // Range is -6 to +6.
    
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    targetDate.setHours(0, 0, 0, 0);
    
    const start = Math.floor(targetDate.getTime() / 1000);
    const end = start + 86400;

    const query = `
    query ($start: Int, $end: Int) {
        Page (page: 1, perPage: 50) {
            pageInfo { hasNextPage, total }
            airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                airingAt
                media {
                    ${MEDIA_FRAGMENT}
                }
            }
        }
    }
    `;

    const data = await fetchAniList(query, { start, end });
    
    interface Schedule {
        airingAt: number;
        media: AniListMedia;
    }

    const animes = data.data.Page.airingSchedules.map((schedule: Schedule) => {
        const anime = mapAnime(schedule.media);
        // Inject broadcast time
        const date = new Date(schedule.airingAt * 1000);
        anime.broadcast = {
            day: dayName,
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            timezone: 'Local',
            string: date.toLocaleString()
        };
        return anime;
    });

    return {
        data: animes,
        pagination: { 
            last_visible_page: 1, 
            has_next_page: data.data.Page.pageInfo.hasNextPage, 
            current_page: 1, 
            items: { count: animes.length, total: data.data.Page.pageInfo.total, per_page: 50 } 
        }
    };
}

export async function getRandomAnime(): Promise<{ data: JikanAnime }> {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    const query = `
    query ($page: Int) {
        Page(page: $page, perPage: 50) {
            media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
                ${MEDIA_FRAGMENT}
            }
        }
    }
    `;
    const data = await fetchAniList(query, { page: randomPage });
    const mediaList = data.data.Page.media;
    if (!mediaList || mediaList.length === 0) {
       throw new Error("No anime found for random selection");
    }
    const randomMedia = mediaList[Math.floor(Math.random() * mediaList.length)];
    return { data: mapAnime(randomMedia) };
}

// --- Additional Types ---

export interface JikanRelation {
  relation: string;
  entry: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
    images?: JikanImage; // Added images
  }[];
}

interface RelationEdge {
    relationType: string;
    node: {
        id: number;
        title: { romaji: string };
        type: string;
        siteUrl: string;
        coverImage?: AniListImage;
    }
}

export async function getAnimeRelations(id: number): Promise<{ data: JikanRelation[] }> {
    const query = `
    query ($id: Int) {
        Media(id: $id) {
            relations {
                edges {
                    relationType
                    node {
                        id
                        title { romaji }
                        type
                        siteUrl
                        coverImage {
                            extraLarge
                            large
                            medium
                        }
                    }
                }
            }
        }
    }
    `;
    
    // 1. Initial Fetch
    const data = await fetchAniList(query, { id });
    let edges: RelationEdge[] = data.data.Media?.relations?.edges || [];
    
    // 2. Check for Parent/Preq to find the "Franchise Root"
    const parentEdge = edges.find(e => 
        (e.relationType === 'PARENT' || e.relationType === 'PREQUEL' || e.relationType === 'FULL_STORY') && 
        e.node.type === 'ANIME'
    );

    if (parentEdge) {
        try {
            const parentId = parentEdge.node.id;
            
            // Fetch the PARENT'S relations which usually contains the whole list
            const parentData = await fetchAniList(query, { id: parentId });
            if (parentData.data.Media?.relations?.edges) {
                 edges = parentData.data.Media.relations.edges;
            }

            // Manually add the Parent itself to the list as "Main Story"
            // (Since a Parent's relations list rarely includes itself)
            const parentInfo = await getAnimeById(parentId);
            
            if (parentInfo.data) {
                const parentEntry: RelationEdge = {
                    relationType: 'Main Story',
                    node: {
                        id: parentInfo.data.mal_id,
                        title: { romaji: parentInfo.data.title },
                        type: parentInfo.data.type,
                        siteUrl: parentInfo.data.url,
                        coverImage: {
                            large: parentInfo.data.images.jpg.large_image_url,
                            medium: parentInfo.data.images.jpg.small_image_url,
                            extraLarge: parentInfo.data.images.jpg.large_image_url
                        }
                    }
                };
                edges = [parentEntry, ...edges];
            }
        } catch (e) {
            console.warn("Retrying parent fetch failed, falling back to current relations", e);
        }
    }

    // 3. Map to Jikan Structure & Beautify
    const relationsMap = new Map<string, JikanRelation['entry']>();
    
    edges.forEach((edge: RelationEdge) => {
        let type = edge.relationType.replace(/_/g, ' ').toLowerCase();
        // Capitalize words
        type = type.replace(/\b\w/g, l => l.toUpperCase());
        
        if (edge.relationType === 'ALTERNATIVE') type = 'Alternative';
        if (edge.relationType === 'Main Story') type = 'Main Story';
        
        if (!relationsMap.has(type)) relationsMap.set(type, []);
        
        const entries = relationsMap.get(type)!;
        // Avoid duplicates in the same category
        if (!entries.find(e => e.mal_id === edge.node.id)) {
            entries.push({
                mal_id: edge.node.id,
                type: edge.node.type, 
                name: edge.node.title.romaji,
                url: edge.node.siteUrl,
                images: edge.node.coverImage ? mapImage(edge.node.coverImage) : undefined
            });
        }
    });

    const result: JikanRelation[] = [];
    relationsMap.forEach((entries, relation) => {
        result.push({ relation, entry: entries });
    });

    // 4. Sort Priority
    const priority = ['Main Story', 'Sequel', 'Prequel', 'Parent Story', 'Full Story', 'Side Story', 'Spin Off', 'Alternative'];
    result.sort((a, b) => {
        const idxA = priority.indexOf(a.relation);
        const idxB = priority.indexOf(b.relation);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
    });

    return { data: result };
}

export async function getMangaById(id: number): Promise<{ data: JikanManga }> {
    // Reusing the same Media query but for Manga logic if needed
    // For now simple map
    const query = `
    query ($id: Int) {
        Media (id: $id, type: MANGA) {
            ${MEDIA_FRAGMENT}
        }
    }
    `;
    const data = await fetchAniList(query, { id });
    const m = data.data.Media;
    
    // Map to JikanManga
    const manga: JikanManga = {
        ...mapAnime(m),  // Reuse base property mapping
        chapters: m.chapters || 0,
        volumes: m.volumes || 0,
        publishing: m.status === 'RELEASING',
        published: mapDate(m.startDate),
        authors: [], // Not fetching staff for now
        serializations: []
    } as unknown as JikanManga; 
    
    return { data: manga };
}

export async function getAnimeGenres(): Promise<{ data: { mal_id: number; name: string; url: string; count: number }[] }> {
    const query = `
    query {
        GenreCollection
    }
    `;
    const data = await fetchAniList(query);
    return {
        data: data.data.GenreCollection.map((g: string, index: number) => ({
            mal_id: index, 
            name: g,
            url: '',
            count: 0
        })).filter((g: { name: string }) => g.name !== 'Hentai') // Filter out adult content if needed
    };
}
