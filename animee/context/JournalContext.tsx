'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from './AuthContext';

export interface Entry {
  _id?: string; // MongoDB ID
  id: number; // Frontend ID (timestamp) - kept for compatibility, but should migrate to _id
  type: 'anime' | 'manga';
  animeId?: number;
  mangaId?: number;
  title: string;
  episode?: number;
  chapter?: number;
  status: string;
  rating: number;
  image?: string;
  progress?: number; // Timestamp in seconds
  watchedEpisodes?: number[]; // List of watched episode numbers
  readChapters?: number[]; // List of read chapter numbers
}

interface JournalContextType {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  removeEntry: (id: number | string) => void;
  updateProgress: (id: number | string, progress: number, subProgress?: number) => void; // subProgress for timestamp
  markComplete: (id: number | string, subId: number) => void; // subId is episode or chapter number
  getEntry: (id: number | string, type: 'anime' | 'manga') => Entry | undefined;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const { user, token, currentProfile } = useAuth();
  const toast = useToast();

  // Load entries
  useEffect(() => {
    if (user && token && currentProfile) {
      fetchEntries();
    } else if (!user) {
      const saved = localStorage.getItem('anirealm-journal');
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        setEntries([
          { id: 1, type: 'anime', animeId: 21, title: 'One Piece', episode: 1080, status: 'Watching', rating: 10, watchedEpisodes: [], image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg' },
          { id: 2, type: 'anime', animeId: 38000, title: 'Demon Slayer: Kimetsu no Yaiba', episode: 1, status: 'Completed', rating: 8, watchedEpisodes: [], image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' },
        ]);
      }
    }
  }, [user, token, currentProfile]);

  // Save to local storage on change if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('anirealm-journal', JSON.stringify(entries));
    }
  }, [entries, user]);

  const fetchEntries = async () => {
    if (!currentProfile) return;
    try {
      const res = await fetch('/api/entries', {
        headers: { 
          'x-auth-token': token!,
          'x-profile-id': currentProfile._id
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend structure
        const mappedEntries = data.map((e: any) => ({
          _id: e._id,
          id: new Date(e.updatedAt).getTime(), // Fallback ID
          type: e.type,
          animeId: e.type === 'anime' ? e.externalId : undefined,
          mangaId: e.type === 'manga' ? e.externalId : undefined,
          title: e.title,
          episode: e.type === 'anime' ? e.progress : undefined,
          chapter: e.type === 'manga' ? e.progress : undefined,
          status: e.status,
          rating: e.score,
          image: e.image,
          watchedEpisodes: e.watchedEpisodes,
          readChapters: e.readChapters
        }));
        setEntries(mappedEntries);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addEntry = useCallback(async (entry: Omit<Entry, 'id'>) => {
    // Check if entry already exists before adding
    const existingEntry = entries.find(e => {
      if (entry.type === 'anime' && e.type === 'anime') {
        return e.animeId === entry.animeId;
      }
      if (entry.type === 'manga' && e.type === 'manga') {
        return e.mangaId === entry.mangaId;
      }
      return false;
    });

    if (existingEntry) {
      toast({ 
        title: 'Already exists', 
        description: 'This entry is already in your journal',
        status: 'warning' 
      });
      return;
    }

    if (user && token && currentProfile) {
      try {
        const body = {
          type: entry.type,
          title: entry.title,
          externalId: entry.type === 'anime' ? entry.animeId : entry.mangaId,
          image: entry.image,
          status: entry.status,
          progress: entry.type === 'anime' ? entry.episode : entry.chapter,
          score: entry.rating,
          watchedEpisodes: entry.watchedEpisodes,
          readChapters: entry.readChapters
        };

        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'x-profile-id': currentProfile._id
          },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          await fetchEntries();
          toast({ title: 'Entry added', status: 'success' });
        } else {
          const error = await res.json();
          toast({ title: 'Failed to add entry', description: error.msg, status: 'error' });
        }
      } catch (err) {
        console.error(err);
        toast({ title: 'Failed to add entry', status: 'error' });
      }
    } else {
      const newEntry = { ...entry, id: Date.now(), watchedEpisodes: [], readChapters: [] };
      setEntries((prev) => [...prev, newEntry]);
      toast({ title: 'Entry added', status: 'success' });
    }
  }, [user, token, currentProfile, toast, entries]);

  const removeEntry = async (id: number | string) => {
    if (user && token && currentProfile && typeof id === 'string') {
      try {
        const res = await fetch(`/api/entries/${id}`, {
          method: 'DELETE',
          headers: { 
            'x-auth-token': token,
            'x-profile-id': currentProfile._id
          }
        });
        if (res.ok) {
          fetchEntries();
          toast({ title: 'Entry removed', status: 'success' });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Entry removed', status: 'success' });
    }
  };

  const updateProgress = async (id: number | string, progress: number, subProgress?: number) => {
    if (user && token && currentProfile && typeof id === 'string') {
       // Find entry to get current state
       const entry = entries.find(e => e._id === id);
       if (!entry) return;

       const body: any = {
         progress: progress
       };
       
       try {
        const res = await fetch(`/api/entries/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'x-auth-token': token,
              'x-profile-id': currentProfile._id
            },
            body: JSON.stringify(body)
         });
         if (res.ok) fetchEntries();
       } catch(err) { console.error(err); }

    } else {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id === id) {
            if (e.type === 'anime') return { ...e, episode: progress };
            return { ...e, chapter: progress };
          }
          return e;
        })
      );
    }
  };

  const markComplete = (id: number | string, subId: number) => {
     if (user && token && currentProfile && typeof id === 'string') {
        // Ideally implement this on backend too
     } else {
        setEntries((prev) =>
          prev.map((e) => {
            if (e.id === id) {
              if (e.type === 'anime') {
                const watched = e.watchedEpisodes?.includes(subId)
                  ? e.watchedEpisodes.filter((ep) => ep !== subId)
                  : [...(e.watchedEpisodes || []), subId];
                return { ...e, watchedEpisodes: watched };
              } else {
                const read = e.readChapters?.includes(subId)
                  ? e.readChapters.filter((ch) => ch !== subId)
                  : [...(e.readChapters || []), subId];
                return { ...e, readChapters: read };
              }
            }
            return e;
          })
        );
     }
  };

  const getEntry = (id: number | string, type: 'anime' | 'manga') => {
    return entries.find((e) => {
        // Match by internal Entry ID (Database ID or Timestamp)
        if (typeof id === 'string' && e._id === id) return true;
        if (e.id === id) return true;

        // Match by Content ID (AnimeID or MangaID)
        if (type === 'anime' && e.type === 'anime' && e.animeId === Number(id)) return true;
        if (type === 'manga' && e.type === 'manga' && e.mangaId === Number(id)) return true;
        
        return false;
    });
  };

  return (
    <JournalContext.Provider value={{ entries, addEntry, removeEntry, updateProgress, markComplete, getEntry }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}

