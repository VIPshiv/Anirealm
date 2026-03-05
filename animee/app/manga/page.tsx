'use client';

import { Box, Container, SimpleGrid, Heading, Text, Flex, Input, InputGroup, InputLeftElement, Spinner, Center, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Badge, IconButton, useToast, VStack, FormControl, FormLabel, Switch, Divider, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, ButtonGroup } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SuwayomiMangaCard from '@/components/SuwayomiMangaCard';
import { 
  getLibrary, SuwayomiManga, 
  getSources, SuwayomiSource, searchSource, getPopularManga, getLatestManga,
  getExtensions, SuwayomiExtension, installExtension, removeExtension,
  getDownloads, SuwayomiDownload,
  addMangaToLibrary,
  getSettings, updateSettings
} from '@/lib/suwayomi';
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Settings, Library, Globe, Puzzle, Plus, Pin, List as ListIcon, X, CheckCircle, Circle, LayoutTemplate, AlignJustify, GalleryHorizontal, Check } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function MangaDashboard() {
  const bg = useColorModeValue('gray.50', 'black');
  const [libraryManga, setLibraryManga] = useState<SuwayomiManga[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const refreshLibrary = useCallback(() => {
    setLibraryLoading(true);
    getLibrary().then(setLibraryManga).finally(() => setLibraryLoading(false));
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);
  
  return (
    <Box minH="100vh" bg={bg}>
      <Navbar />
      <Container maxW="7xl" py={8} mt={16}>
        <Tabs variant="soft-rounded" colorScheme="pink" isLazy>
          <TabList mb={8} overflowX="auto" py={2}>
            <Tab><Flex align="center" gap={2}><Library size={18} /> Library</Flex></Tab>
            <Tab><Flex align="center" gap={2}><Globe size={18} /> Sources</Flex></Tab>
            <Tab><Flex align="center" gap={2}><Puzzle size={18} /> Extensions</Flex></Tab>
            <Tab><Flex align="center" gap={2}><Download size={18} /> Downloads</Flex></Tab>
            <Tab><Flex align="center" gap={2}><Settings size={18} /> Settings</Flex></Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}><LibraryTab mangaList={libraryManga} loading={libraryLoading} /></TabPanel>
            <TabPanel px={0}><SourcesTab libraryManga={libraryManga} onLibraryUpdate={refreshLibrary} /></TabPanel>
            <TabPanel px={0}><ExtensionsTab /></TabPanel>
            <TabPanel px={0}><DownloadsTab /></TabPanel>
            <TabPanel px={0}><SettingsTab /></TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
      <Footer />
    </Box>
  );
}

function LibraryTab({ mangaList, loading }: { mangaList: SuwayomiManga[], loading: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const inputBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const filteredManga = mangaList.filter(manga => 
    manga.title.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  // Defensive deduplication to prevent "same key" errors
  const uniqueFilteredManga = Array.from(new Map(filteredManga.map(m => [m.id, m])).values());

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Your Library</Heading>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents='none'><Search size={18} /></InputLeftElement>
          <Input 
            placeholder="Search library..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={inputBg}
          />
        </InputGroup>
      </Flex>

      {loading ? (
        <Center py={20}><Spinner size="xl" /></Center>
      ) : (
        <MotionSimpleGrid 
          columns={{ base: 2, md: 3, lg: 4, xl: 5 }} 
          spacing={6}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {uniqueFilteredManga.map((manga) => (
            <MotionBox key={manga.id} variants={itemVariants} layout>
              <SuwayomiMangaCard manga={manga} />
            </MotionBox>
          ))}
        </MotionSimpleGrid>
      )}
      {!loading && uniqueFilteredManga.length === 0 && (
        <Center py={20}><Text color="gray.500">No manga found.</Text></Center>
      )}
    </Box>
  );
}

function SourcesTab({ libraryManga, onLibraryUpdate }: { libraryManga: SuwayomiManga[], onLibraryUpdate: () => void }) {
  const [sourceGroups, setSourceGroups] = useState<{name: string, sources: SuwayomiSource[]}[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{name: string, sources: SuwayomiSource[]} | null>(null);
  const [selectedSource, setSelectedSource] = useState<SuwayomiSource | null>(null);
  const [viewMode, setViewMode] = useState<'stack' | 'tabs' | 'showcase'>('stack');
  const [searchResults, setSearchResults] = useState<SuwayomiManga[]>([]);
  const [latestResults, setLatestResults] = useState<SuwayomiManga[]>([]);
  const [popularPage, setPopularPage] = useState(1);
  const [latestPage, setLatestPage] = useState(1);
  const [loadingMorePopular, setLoadingMorePopular] = useState(false);
  const [loadingMoreLatest, setLoadingMoreLatest] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);
  
  // Global Search State
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<{source: SuwayomiSource, results: SuwayomiManga[]}[]>([]);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'black');
  const globalSearchBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accordionButtonBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  useEffect(() => {
    // Load pins
    const savedPins = localStorage.getItem('pinnedSources');
    if (savedPins) {
      try {
        setPinnedSources(JSON.parse(savedPins));
      } catch (e) {
        console.error('Failed to parse pinned sources', e);
      }
    }

    getSources().then(data => {
      // Deduplicate sources by ID
      const unique = Array.from(new Map(data.map(s => [s.id, s])).values());
      
      // Group sources by base name (e.g. "MangaPark (EN)" -> "MangaPark")
      const groups: Record<string, SuwayomiSource[]> = {};
      unique.forEach(source => {
        const baseName = source.name.replace(/\s*\(.+\)$/, '').trim();
        if (!groups[baseName]) groups[baseName] = [];
        groups[baseName].push(source);
      });

      const groupList = Object.entries(groups)
        .map(([name, sources]) => ({ name, sources }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setSourceGroups(groupList);
    });
  }, []);

  const togglePin = (sourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newPins = pinnedSources.includes(sourceId)
      ? pinnedSources.filter(id => id !== sourceId)
      : [...pinnedSources, sourceId];
    
    setPinnedSources(newPins);
    localStorage.setItem('pinnedSources', JSON.stringify(newPins));
    
    toast({
      title: newPins.includes(sourceId) ? "Source Selected" : "Source Unselected",
      status: "success",
      duration: 2000,
    });
  };

  const handleGlobalSearch = async () => {
    if (!globalQuery) return;
    
    if (pinnedSources.length === 0) {
      toast({
        title: "No Sources Selected",
        description: "Please select at least one source to search.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsGlobalSearching(true);
    setGlobalResults([]);

    try {
      // Use the new Backend Proxy for resilient searching
      const sourceIds = pinnedSources.join(',');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(globalQuery)}&sources=${encodeURIComponent(sourceIds)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const allResults: (SuwayomiManga & { sourceId: string })[] = data.results || [];
      const errors: { sourceId: string, message: string }[] = data.errors || [];

      // Group results by source
      const allSources = sourceGroups.flatMap(g => g.sources);
      const groupedResults: { source: SuwayomiSource, results: SuwayomiManga[] }[] = [];

      // We only care about sources that actually returned results
      const uniqueSourceIds = Array.from(new Set(allResults.map(r => r.sourceId)));

      uniqueSourceIds.forEach(sid => {
        const sourceObj = allSources.find(s => s.id === sid);
        if (sourceObj) {
          const sourceManga = allResults.filter(r => r.sourceId === sid);
          // Deduplicate
          const uniqueManga = Array.from(new Map(sourceManga.map(m => [m.url, m])).values());
          groupedResults.push({
            source: sourceObj,
            results: uniqueManga
          });
        }
      });

      setGlobalResults(groupedResults);
      
      // Report failures
      if (errors.length > 0) {
        const cloudflareErrors = errors.filter(e => e.message.includes('Cloudflare'));
        const otherErrors = errors.filter(e => !e.message.includes('Cloudflare'));

        if (cloudflareErrors.length > 0) {
             const names = cloudflareErrors.map(e => {
                 const s = allSources.find(src => src.id === e.sourceId);
                 return s ? s.name : 'Unknown Source';
             }).join(', ');
             
             toast({
                 title: "Cloudflare Block Detected",
                 description: `${names} is blocked. Open Suwayomi (port 4567) -> Sources -> Globe Icon to solve captcha.`,
                 status: "error",
                 duration: 10000,
                 isClosable: true
             });
        }

        if (otherErrors.length > 0) {
          const failedNames = otherErrors.map(e => {
             const s = allSources.find(src => src.id === e.sourceId);
             return s ? s.name : 'Unknown Source';
          }).slice(0, 5);
          
          const moreCount = otherErrors.length - failedNames.length;
          const msg = `Failed: ${failedNames.join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`;

          toast({
            title: "Some sources failed",
            description: msg,
            status: "warning",
            duration: 6000,
            isClosable: true
          });
        }
      }

      if (groupedResults.length === 0 && errors.length === 0) {
        toast({ 
          title: "No results found", 
          description: "Try different keywords or sources.",
          status: "info",
          duration: 3000,
          isClosable: true
        });
      } else if (groupedResults.length > 0) {
         toast({ title: `Found results from ${groupedResults.length} sources`, status: "success" });
      }
    } catch {
      toast({ title: "Global search failed", status: "error" });
    } finally {
      setIsGlobalSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedSource || !searchQuery) return;
    setLoading(true);
    try {
      const results = await searchSource(selectedSource.id, searchQuery);
      // Deduplicate results by URL
      const uniqueResults = Array.from(new Map(results.map(m => [m.url, m])).values());
      setSearchResults(uniqueResults);
    } catch {
      toast({ title: "Search failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async (manga: SuwayomiManga) => {
    // Check for duplicates
    const exactMatch = libraryManga.find(m => m.url === manga.url && m.sourceId === manga.sourceId);
    if (exactMatch) {
      toast({ title: "Already in library", status: "info" });
      return;
    }

    const titleMatch = libraryManga.find(m => m.title.toLowerCase() === manga.title.toLowerCase());
    if (titleMatch) {
      const confirmAdd = window.confirm(`"${manga.title}" is already in your library from ${titleMatch.sourceId || 'another source'}. Do you want to add this version too?`);
      if (!confirmAdd) return;
    }

    try {
      await addMangaToLibrary(manga.sourceId, manga.url, manga.title);
      toast({ title: "Added to library", status: "success" });
      onLibraryUpdate();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to add", description: String(e), status: "error" });
    }
  };

  const handleGroupClick = (group: {name: string, sources: SuwayomiSource[]}) => {
    // Check if any source in this group is pinned
    // const pinnedInGroup = group.sources.find(s => pinnedSources.includes(s.id));

    if (group.sources.length === 1) {
      setSelectedSource(group.sources[0]);
      setSelectedGroup(group);
    } else {
      // Always show group view for multi-variant sources, even if one is pinned
      setSelectedGroup(group);
    }
  };

  // 3. Search View (Specific Source Selected)
  useEffect(() => {
    if (selectedSource) {
      setSearchResults([]);
      setLatestResults([]);
      setSearchQuery('');
      setPopularPage(1);
      setLatestPage(1);
      setLoading(true);
      
      Promise.all([
        getPopularManga(selectedSource.id, 1).catch(() => []),
        getLatestManga(selectedSource.id, 1).catch(() => [])
      ]).then(([popular, latest]) => {
          const uniquePopular = Array.from(new Map(popular.map(m => [m.url, m])).values());
          const uniqueLatest = Array.from(new Map(latest.map(m => [m.url, m])).values());
          setSearchResults(uniquePopular);
          setLatestResults(uniqueLatest);
      }).finally(() => setLoading(false));
    }
  }, [selectedSource]);

  const loadMorePopular = async () => {
    if (!selectedSource) return;
    setLoadingMorePopular(true);
    const nextPage = popularPage + 1;
    try {
      const newManga = await getPopularManga(selectedSource.id, nextPage);
      if (newManga.length > 0) {
        setSearchResults(prev => {
          const combined = [...prev, ...newManga];
          return Array.from(new Map(combined.map(m => [m.url, m])).values());
        });
        setPopularPage(nextPage);
      } else {
        toast({ title: "No more popular manga", status: "info" });
      }
    } catch {
      toast({ title: "Failed to load more", status: "error" });
    } finally {
      setLoadingMorePopular(false);
    }
  };

  const loadMoreLatest = async () => {
    if (!selectedSource) return;
    setLoadingMoreLatest(true);
    const nextPage = latestPage + 1;
    try {
      const newManga = await getLatestManga(selectedSource.id, nextPage);
      if (newManga.length > 0) {
        setLatestResults(prev => {
          const combined = [...prev, ...newManga];
          return Array.from(new Map(combined.map(m => [m.url, m])).values());
        });
        setLatestPage(nextPage);
      } else {
        toast({ title: "No more updates", status: "info" });
      }
    } catch {
      toast({ title: "Failed to load more", status: "error" });
    } finally {
      setLoadingMoreLatest(false);
    }
  };

  if (selectedSource) {
    return (
      <Box>
        <Button mb={4} onClick={() => { 
          setSelectedSource(null); 
          setSearchResults([]); 
          setLatestResults([]);
          setSearchQuery(''); 
          // If the group had only 1 source, go back to main list. Otherwise go back to group view.
          if (selectedGroup && selectedGroup.sources.length === 1) {
            setSelectedGroup(null);
          }
        }}>
          Back to {selectedGroup?.sources.length === 1 ? 'Sources' : selectedGroup?.name}
        </Button>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            {selectedSource.name} 
            <Badge ml={2} colorScheme="blue">{selectedSource.lang}</Badge>
            {pinnedSources.includes(selectedSource.id) && <Badge ml={2} colorScheme="pink">SELECTED</Badge>}
          </Heading>
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton 
              aria-label="Stack View" 
              icon={<LayoutTemplate size={18} />} 
              colorScheme={viewMode === 'stack' ? 'pink' : 'gray'}
              onClick={() => setViewMode('stack')}
            />
            <IconButton 
              aria-label="Tabs View" 
              icon={<AlignJustify size={18} />} 
              colorScheme={viewMode === 'tabs' ? 'pink' : 'gray'}
              onClick={() => setViewMode('tabs')}
            />
            <IconButton 
              aria-label="Showcase View" 
              icon={<GalleryHorizontal size={18} />} 
              colorScheme={viewMode === 'showcase' ? 'pink' : 'gray'}
              onClick={() => setViewMode('showcase')}
            />
          </ButtonGroup>
        </Flex>
        <Flex gap={2} mb={6}>
          <Input 
            placeholder="Search manga..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} isLoading={loading} colorScheme="pink">Search</Button>
        </Flex>

        {loading && searchResults.length === 0 && latestResults.length === 0 ? (
          <Center py={10}><Spinner /></Center>
        ) : searchResults.length === 0 && latestResults.length === 0 ? (
          <Center py={10} flexDirection="column" gap={2}>
            <Text color="gray.500" fontSize="lg">Not Available</Text>
            <Text color="gray.400" fontSize="sm">This source might be blocked (Cloudflare) or having issues.</Text>
          </Center>
        ) : (
          <>
            {/* Search Results (Always Stacked if searching) */}
            {searchQuery && searchResults.length > 0 && (
              <Box mb={8}>
                <Heading size="md" mb={4}>Search Results</Heading>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                  {searchResults.map((manga) => {
                    const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                    return (
                    <Box key={manga.url} position="relative" role="group">
                      <SuwayomiMangaCard 
                        manga={manga} 
                        inLibrary={isAdded}
                      />
                      <IconButton
                        aria-label={isAdded ? "Added to library" : "Add to library"}
                        icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme={isAdded ? "gray" : "green"}
                        isDisabled={isAdded}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isAdded) handleAddToLibrary(manga);
                        }}
                      />
                    </Box>
                  )})}
                </SimpleGrid>
              </Box>
            )}

            {/* Main Content Views (Only if not searching) */}
            {!searchQuery && (
              <>
                {/* STACK VIEW (Default) */}
                {viewMode === 'stack' && (
                  <>
                    {searchResults.length > 0 && (
                      <Box mb={8}>
                        <Box 
                          position="sticky" 
                          top="0" 
                          zIndex={10} 
                          py={3} 
                          bg={bg} 
                          mb={4}
                          borderBottomWidth="1px"
                          borderColor={borderColor}
                          boxShadow="sm"
                        >
                          <Heading size="sm" color="gray.500">Popular Manga</Heading>
                        </Box>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                          {searchResults.map((manga) => {
                            const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                            return (
                            <Box key={manga.url} position="relative" role="group">
                              <SuwayomiMangaCard 
                                manga={manga} 
                                inLibrary={isAdded}
                              />
                              <IconButton
                                aria-label={isAdded ? "Added to library" : "Add to library"}
                                icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={isAdded ? "gray" : "green"}
                                isDisabled={isAdded}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isAdded) handleAddToLibrary(manga);
                                }}
                              />
                            </Box>
                          )})}
                        </SimpleGrid>
                        <Center mt={6}>
                          <Button onClick={loadMorePopular} isLoading={loadingMorePopular} variant="outline">
                            Load More Popular
                          </Button>
                        </Center>
                      </Box>
                    )}

                    {latestResults.length > 0 && (
                      <Box>
                        <Box 
                          position="sticky" 
                          top="0" 
                          zIndex={10} 
                          py={3} 
                          bg={bg} 
                          mb={4}
                          borderBottomWidth="1px"
                          borderColor={borderColor}
                          boxShadow="sm"
                        >
                          <Heading size="sm" color="gray.500">Latest Updates</Heading>
                        </Box>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                          {latestResults.map((manga) => {
                            const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                            return (
                            <Box key={manga.url} position="relative" role="group">
                              <SuwayomiMangaCard 
                                manga={manga} 
                                inLibrary={isAdded}
                              />
                              <IconButton
                                aria-label={isAdded ? "Added to library" : "Add to library"}
                                icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={isAdded ? "gray" : "green"}
                                isDisabled={isAdded}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isAdded) handleAddToLibrary(manga);
                                }}
                              />
                            </Box>
                          )})}
                        </SimpleGrid>
                        <Center mt={6}>
                          <Button onClick={loadMoreLatest} isLoading={loadingMoreLatest} variant="outline">
                            Load More Updates
                          </Button>
                        </Center>
                      </Box>
                    )}
                  </>
                )}

                {/* TABS VIEW */}
                {viewMode === 'tabs' && (
                  <Tabs colorScheme="pink" isLazy>
                    <TabList mb={4}>
                      <Tab>Popular</Tab>
                      <Tab>Latest Updates</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                          {searchResults.map((manga) => {
                            const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                            return (
                            <Box key={manga.url} position="relative" role="group">
                              <SuwayomiMangaCard 
                                manga={manga} 
                                inLibrary={isAdded}
                              />
                              <IconButton
                                aria-label={isAdded ? "Added to library" : "Add to library"}
                                icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={isAdded ? "gray" : "green"}
                                isDisabled={isAdded}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isAdded) handleAddToLibrary(manga);
                                }}
                              />
                            </Box>
                          )})}
                        </SimpleGrid>
                        <Center mt={6}>
                          <Button onClick={loadMorePopular} isLoading={loadingMorePopular} variant="outline">
                            Load More Popular
                          </Button>
                        </Center>
                      </TabPanel>
                      <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                          {latestResults.map((manga) => {
                            const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                            return (
                            <Box key={manga.url} position="relative" role="group">
                              <SuwayomiMangaCard 
                                manga={manga} 
                                inLibrary={isAdded}
                              />
                              <IconButton
                                aria-label={isAdded ? "Added to library" : "Add to library"}
                                icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={isAdded ? "gray" : "green"}
                                isDisabled={isAdded}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isAdded) handleAddToLibrary(manga);
                                }}
                              />
                            </Box>
                          )})}
                        </SimpleGrid>
                        <Center mt={6}>
                          <Button onClick={loadMoreLatest} isLoading={loadingMoreLatest} variant="outline">
                            Load More Updates
                          </Button>
                        </Center>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                )}

                {/* SHOWCASE VIEW */}
                {viewMode === 'showcase' && (
                  <Box>
                    <Heading size="md" mb={4}>Popular Now</Heading>
                    <Flex 
                      overflowX="auto" 
                      gap={4} 
                      pb={6} 
                      css={{
                        '&::-webkit-scrollbar': { height: '8px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                      }}
                    >
                      {searchResults.map((manga) => {
                        const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                        return (
                        <Box key={manga.url} minW="160px" maxW="160px" position="relative" role="group">
                          <SuwayomiMangaCard 
                            manga={manga} 
                            inLibrary={isAdded}
                          />
                          <IconButton
                            aria-label={isAdded ? "Added to library" : "Add to library"}
                            icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme={isAdded ? "gray" : "green"}
                            size="sm"
                            isDisabled={isAdded}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAdded) handleAddToLibrary(manga);
                            }}
                          />
                        </Box>
                      )})}
                      <Center minW="100px">
                        <Button onClick={loadMorePopular} isLoading={loadingMorePopular} variant="ghost" size="sm">
                          Load More
                        </Button>
                      </Center>
                    </Flex>
                    
                    <Divider my={8} />

                    <Heading size="md" mb={4}>Latest Updates</Heading>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                      {latestResults.map((manga) => {
                        const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                        return (
                        <Box key={manga.url} position="relative" role="group">
                          <SuwayomiMangaCard 
                            manga={manga} 
                            inLibrary={isAdded}
                          />
                          <IconButton
                            aria-label={isAdded ? "Added to library" : "Add to library"}
                            icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme={isAdded ? "gray" : "green"}
                            isDisabled={isAdded}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isAdded) handleAddToLibrary(manga);
                            }}
                          />
                        </Box>
                      )})}
                    </SimpleGrid>
                    <Center mt={6}>
                      <Button onClick={loadMoreLatest} isLoading={loadingMoreLatest} variant="outline">
                        Load More Updates
                      </Button>
                    </Center>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>
    );
  }

  // 2. Group View (Multiple variants in one group)
  if (selectedGroup) {
    // Sort sources: Pinned first, then alphabetical
    const sortedSources = [...selectedGroup.sources].sort((a, b) => {
      const aPinned = pinnedSources.includes(a.id);
      const bPinned = pinnedSources.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <Box>
        <Button mb={4} onClick={() => setSelectedGroup(null)}>Back to Sources</Button>
        <Heading size="md" mb={6}>{selectedGroup.name} Variants</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {sortedSources.map(source => {
            const isPinned = pinnedSources.includes(source.id);
            return (
              <Box 
                key={source.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="lg" 
                cursor="pointer"
                onClick={() => setSelectedSource(source)}
                _hover={{ bg: 'whiteAlpha.100' }}
                borderColor={isPinned ? 'pink.400' : 'inherit'}
                bg={isPinned ? 'pink.50' : 'inherit'}
                _dark={{ bg: isPinned ? 'pink.900' : 'inherit' }}
              >
                <Flex align="center" justify="space-between">
                  <Box>
                    <Flex align="center" gap={2}>
                      <Heading size="sm">{source.name}</Heading>
                      {isPinned && <Badge colorScheme="pink">SELECTED</Badge>}
                    </Flex>
                    <Text fontSize="xs" color="gray.500">Language: {source.lang.toUpperCase()}</Text>
                  </Box>
                  <IconButton 
                    aria-label={isPinned ? "Unselect source" : "Select source"}
                    icon={isPinned ? <CheckCircle size={18} fill="currentColor" /> : <Circle size={18} />}
                    variant="ghost"
                    colorScheme={isPinned ? "pink" : "gray"}
                    onClick={(e) => togglePin(source.id, e)}
                  />
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  }

  // 1. Main List (Groups)
  const filteredGroups = sourceGroups.filter(g => 
    g.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Global Search Section */}
      <Box mb={8} p={6} bg={globalSearchBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={2}>Global Search</Heading>
        <Text fontSize="sm" color="gray.500" mb={4}>
          Search for manga across your <b>Selected Sources</b>. Select sources below to include them.
        </Text>
        <Flex gap={2} mb={4}>
          <Input 
            placeholder="Search manga title..." 
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
          />
          <Button 
            colorScheme="pink" 
            onClick={handleGlobalSearch}
            isLoading={isGlobalSearching}
            leftIcon={<Search size={18} />}
          >
            Search
          </Button>
        </Flex>
        
        {/* Global Results Display */}
        {globalResults.length > 0 && (
          <Accordion allowMultiple defaultIndex={[0]}>
            {globalResults.map((res) => (
              <AccordionItem key={res.source.id} border="none" mb={4}>
                <h2>
                  <AccordionButton bg={accordionButtonBg} borderRadius="md" _expanded={{ bg: 'pink.500', color: 'white' }}>
                    <Box as="span" flex='1' textAlign='left' fontWeight="bold">
                      {res.source.name} ({res.results.length})
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} px={0}>
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4} mt={2}>
                    {res.results.map((manga) => {
                      const isAdded = libraryManga.some(m => m.url === manga.url && m.sourceId === manga.sourceId);
                      return (
                      <Box key={manga.url} position="relative" role="group">
                        <SuwayomiMangaCard 
                          manga={manga} 
                          inLibrary={isAdded}
                        />
                        <IconButton
                          aria-label={isAdded ? "Added to library" : "Add to library"}
                          icon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                          position="absolute"
                          top={2}
                          right={2}
                          colorScheme={isAdded ? "gray" : "green"}
                          size="sm"
                          isDisabled={isAdded}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isAdded) handleAddToLibrary(manga);
                          }}
                        />
                      </Box>
                    )})}
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {globalResults.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => { setGlobalResults([]); setGlobalQuery(''); }} leftIcon={<X size={16} />}>
            Clear Results
          </Button>
        )}
      </Box>

      <Divider my={8} />

      <InputGroup mb={6}>
        <InputLeftElement pointerEvents='none'><Search size={18} /></InputLeftElement>
        <Input 
          placeholder="Filter sources..." 
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </InputGroup>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {filteredGroups.map(group => {
          const pinnedCount = group.sources.filter(s => pinnedSources.includes(s.id)).length;
          const hasPinned = pinnedCount > 0;
          const isSingle = group.sources.length === 1;

          return (
            <Box 
              key={group.name} 
              p={4} 
              borderWidth="1px" 
              borderRadius="lg" 
              cursor="pointer"
              onClick={() => handleGroupClick(group)}
              _hover={{ bg: 'whiteAlpha.100' }}
              borderColor={isSingle && hasPinned ? 'pink.400' : 'inherit'}
            >
              <Flex align="center" justify="space-between">
                <Box>
                  <Flex align="center" gap={2}>
                    <Heading size="sm">{group.name}</Heading>
                    {/* Only show PINNED badge for single sources to avoid clutter on multi-source groups */}
                    {isSingle && hasPinned && <Badge colorScheme="pink">SELECTED</Badge>}
                  </Flex>
                  <Text fontSize="xs" color="gray.500">
                    {group.sources.length} {group.sources.length === 1 ? 'Source' : 'Sources'}
                  </Text>
                </Box>
                {group.sources.length > 1 ? (
                  <IconButton
                    aria-label="View all variants"
                    icon={<ListIcon size={18} />}
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                    }}
                  />
                ) : (
                  <IconButton
                    aria-label={hasPinned ? "Unselect source" : "Select source"}
                    icon={hasPinned ? <CheckCircle size={18} fill="currentColor" /> : <Circle size={18} />}
                    variant="ghost"
                    colorScheme={hasPinned ? "pink" : "gray"}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(group.sources[0].id);
                    }}
                  />
                )}
              </Flex>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

function ExtensionsTab() {
  const [extensions, setExtensions] = useState<SuwayomiExtension[]>([]);
  const toast = useToast();

  const fetchExtensions = () => getExtensions().then(setExtensions);

  useEffect(() => {
    fetchExtensions();
  }, []);

  const handleInstall = async (pkgName: string) => {
    try {
      await installExtension(pkgName);
      toast({ title: "Installed", status: "success" });
      fetchExtensions();
    } catch {
      toast({ title: "Failed", status: "error" });
    }
  };

  const handleRemove = async (pkgName: string) => {
    try {
      await removeExtension(pkgName);
      toast({ title: "Removed", status: "success" });
      fetchExtensions();
    } catch {
      toast({ title: "Failed", status: "error" });
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {extensions.map(ext => (
        <Flex key={ext.pkgName} p={4} borderWidth="1px" borderRadius="lg" justify="space-between" align="center">
          <Box>
            <Heading size="sm">{ext.name}</Heading>
            <Text fontSize="xs" color="gray.500">{ext.version}</Text>
          </Box>
          {ext.installed ? (
            <Button size="sm" colorScheme="red" onClick={() => handleRemove(ext.pkgName)}>Uninstall</Button>
          ) : (
            <Button size="sm" colorScheme="blue" onClick={() => handleInstall(ext.pkgName)}>Install</Button>
          )}
        </Flex>
      ))}
    </SimpleGrid>
  );
}

function DownloadsTab() {
  const [downloads, setDownloads] = useState<SuwayomiDownload[]>([]);

  useEffect(() => {
    getDownloads().then(setDownloads);
    const interval = setInterval(() => getDownloads().then(setDownloads), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <VStack align="stretch" spacing={4}>
      {downloads.length === 0 && <Text color="gray.500">No active downloads.</Text>}
      {downloads.map(dl => (
        <Box key={dl.id} p={4} borderWidth="1px" borderRadius="lg">
          <Flex justify="space-between">
            <Text>Chapter {dl.chapterId}</Text>
            <Badge colorScheme={dl.status === 'DOWNLOADED' ? 'green' : 'yellow'}>{dl.status}</Badge>
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const toast = useToast();

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast({ title: "Settings saved", status: "success" });
    } catch {
      toast({ title: "Failed to save", status: "error" });
    }
  };

  if (!settings) return <Text>Loading settings...</Text>;

  return (
    <VStack align="stretch" spacing={6} maxW="md">
      <Heading size="md">Server Settings</Heading>
      {/* Example settings - adjust based on actual API response structure */}
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="auto-update" mb="0">
          Auto Update Extensions
        </FormLabel>
        <Switch id="auto-update" />
      </FormControl>
      <Button colorScheme="pink" onClick={handleSave}>Save Changes</Button>
    </VStack>
  );
}
