import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { searchAnime, searchManga, JikanAnime, JikanManga } from '@/lib/anilist';

export type SearchType = 'anime' | 'manga';

export function useAnimeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('anime');
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [suggestions, setSuggestions] = useState<(JikanAnime | JikanManga)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        // Clear previous suggestions while loading new ones to avoid stale data flicker
        if (searchType === 'anime') {
            const res = await searchAnime({ q: debouncedQuery, page: 1, limit: 5 });
            const unique = Array.from(new Map(res.data.map(item => [item.mal_id, item])).values());
            setSuggestions(unique);
        } else {
            const res = await searchManga(debouncedQuery, 1);
            const unique = Array.from(new Map(res.data.map(item => [item.mal_id, item])).values());
            setSuggestions(unique.slice(0, 5));
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSuggestions([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, searchType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 1) {
      setIsSearchOpen(true);
    }
  };

  const toggleSearchType = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSearchType(prev => prev === 'anime' ? 'manga' : 'anime');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      if (searchType === 'anime') {
        router.push(`/library?search=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push(`/manga?search=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (item: JikanAnime | JikanManga) => {
      if (searchType === 'anime') {
        router.push(`/anime/${item.mal_id}?title=${encodeURIComponent(item.title)}`);
      } else {
        router.push(`/manga/${item.mal_id}`); 
      }
      setIsSearchOpen(false);
      setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    suggestions,
    loading,
    isSearchOpen,
    setIsSearchOpen,
    searchRef,
    handleSearchChange,
    handleSearchSubmit,
    toggleSearchType,
    handleSuggestionClick
  };
}
