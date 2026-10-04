'use client';

import { useState, useEffect } from 'react';
import { 
  Box, Container, Flex, Heading, Text, Button, IconButton, 
  useColorModeValue, VStack, HStack,
  Switch, FormControl, FormLabel, useToast, Spinner, Center, Badge
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { JikanAnime, JikanEpisode } from '@/lib/anilist';
import { getStreamingSource } from '@/app/actions/anime';
import { AnimeSource, ServerData } from '@/lib/consumet';
import { useJournal } from '@/context/JournalContext';
import { ArrowLeft, ArrowRight, SkipForward, Check, Monitor, Download } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import { FilterMenu } from '@/components/FilterMenu';
import HlsPlayer from '@/components/HlsPlayer';
import TrailerPlayer from '@/components/TrailerPlayer';

interface WatchClientProps {
    anime: JikanAnime;
    episodes: JikanEpisode[];
    animeId: string | null; // The streaming ID
    currentEpNum: number;
    dbId: number;
    availableEpisodes: number[]; // From streaming provider
}

export default function WatchClient({ anime, episodes, animeId, currentEpNum, dbId, availableEpisodes }: WatchClientProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useToast();
  const { updateProgress, getEntry, addEntry } = useJournal();
  
  // Color mode hooks
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('pink.500', 'pink.300');
  const mainBg = useColorModeValue('gray.50', 'black');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const ghostHoverBg = useColorModeValue('gray.100', 'gray.700');
  const controlBg = useColorModeValue('gray.100', 'gray.700');

  const [streamSource, setStreamSource] = useState<AnimeSource | null>(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [streamError, setStreamError] = useState(false);
  
  const currentEpisode = episodes.find(e => e.mal_id === currentEpNum);
  
  const [server, setServer] = useState('Default');
  const [lang, setLang] = useState<'sub' | 'dub'>('sub');
  const [autoNext, setAutoNext] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [availableServers, setAvailableServers] = useState<ServerData[]>([]);
  const [selectedServerObj, setSelectedServerObj] = useState<ServerData | null>(null);
  
  // 1. Fetch Stream Source (Client Side Only - depends on Episode Selection)
  useEffect(() => {
    const fetchStream = async () => {
      if (!animeId || !currentEpNum) {
          setLoadingStep('Stream not available.');
          setStreamError(true);
          return;
      }

      setIsStreamLoading(true);
      setStreamError(false);
      setLoadingStep('Initializing...');
      setStreamSource(null);
      
      try {
        setLoadingStep('Connecting to Sanka anime API...');
        
        const result = await getStreamingSource(animeId, String(currentEpNum));
        
        if (result.success) {
            const serversData = result.data;
            if (serversData && serversData.length > 0) {
                setLoadingStep('Bufferring video...');
                setAvailableServers(serversData);
                
                // Default to first server
                const firstServer = serversData[0];
                setSelectedServerObj(firstServer);
                setServer(firstServer.serverName);
                
                // Default to first source of that server
                if (firstServer.sources && firstServer.sources.length > 0) {
                    setStreamSource(firstServer.sources[0]);
                } else {
                    setStreamError(true);
                }
            } else {
                setLoadingStep('Stream not found on any server.');
                setStreamError(true);
            }
        } else {
            setLoadingStep(result.error || 'Stream error.');
            setStreamError(true);
        }
      } catch (e) {
        console.error(e);
        setLoadingStep('Error loading stream.');
        setStreamError(true);
        toast({ title: "Failed to load stream", description: "All servers failed.", status: "error" });
      } finally {
        setIsStreamLoading(false);
      }
    };
    fetchStream();
  }, [animeId, currentEpNum, toast, anime]); // Removed id/updateProgress deps that weren't strictly needed for fetching

  // 2. Intro Skip Logic
  useEffect(() => {
    // Simulate intro detection
    const timer = setTimeout(() => setShowSkipIntro(true), 5000);
    const timerHide = setTimeout(() => setShowSkipIntro(false), 15000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timerHide);
    };
  }, [currentEpNum]);

  const handleNextEpisode = () => {
    if (anime && currentEpNum < (anime.episodes || episodes.length)) {
      router.push(`/anime/${dbId}/watch?ep=${currentEpNum + 1}${animeId ? `&animeId=${animeId}` : ''}&title=${encodeURIComponent(anime.title)}`);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpNum > 1) {
      router.push(`/anime/${dbId}/watch?ep=${currentEpNum - 1}${animeId ? `&animeId=${animeId}` : ''}&title=${encodeURIComponent(anime.title)}`);
    }
  };

  // 3. Track progress
  useEffect(() => {
      if (!anime) return;

      // Check if in journal, if not add it
      const entry = getEntry(dbId, 'anime');
      if (!entry) {
          addEntry({
              type: 'anime',
              animeId: dbId,
              title: anime.title,
              episode: currentEpNum,
              status: 'Watching',
              rating: 0,
              image: anime.images.jpg.large_image_url,
              progress: Date.now()
          });
      } else {
          // Update immediately on load/change only if different
          if (entry.episode !== currentEpNum) {
             updateProgress(entry._id || entry.id, currentEpNum, Date.now());
          }
      }
  }, [dbId, currentEpNum, anime, getEntry, addEntry, updateProgress]);

  // 4. Interval update
  useEffect(() => {
      const interval = setInterval(() => {
          const entry = getEntry(dbId, 'anime');
          if (entry && entry.episode !== currentEpNum) {
            updateProgress(entry._id || entry.id, currentEpNum, Date.now()); 
          }
      }, 5000);
      
      return () => clearInterval(interval);
  }, [dbId, currentEpNum, updateProgress, getEntry]);


  // Helper to proxy URLs
  const getProxiedUrl = (url: string, referer?: string) => {
      if (!url) return '';
      if (url.startsWith('/')) return url;
      
      const encodedUrl = encodeURIComponent(url);
      const encodedReferer = referer ? encodeURIComponent(referer) : '';
      return `/api/proxy?url=${encodedUrl}&referer=${encodedReferer}`;
  };

  if (!mounted) return null;

  return (
    <Box minH="100vh" bg={mainBg} pb={10}>
      {/* Player Section */}
      <Box bg="black" w="full">
        <Container maxW="container.xl" p={0}>
          <Box position="relative" w="full" pt="56.25%" overflow="hidden">
            <Box position="absolute" top={0} left={0} right={0} bottom={0}>
               {/* Real Player Logic */}
               {isStreamLoading ? (
                 <Center h="full" bg="black" flexDirection="column" gap={4}>
                   <Spinner size="xl" color="pink.500" thickness="4px" />
                   <Text color="white" fontWeight="bold">{loadingStep}</Text>
                   <Text color="gray.400" fontSize="sm">Please wait while we fetch the stream...</Text>
                 </Center>
               ) : streamError ? (
                 <Center h="full" bg="gray.900" color="white" flexDirection="column" gap={4}>
                   <Heading size="md" color="red.400">Stream Failed to Load</Heading>
                   <Text>We couldn&apos;t load the video for this episode.</Text>
                   <Button 
                     size="sm" 
                     colorScheme="pink" 
                     onClick={() => window.location.reload()}
                   >
                     Retry
                   </Button>
                 </Center>
               ) : streamSource ? (
                 streamSource.isM3U8 ? (
                    <HlsPlayer 
                        key={streamSource.url} 
                        src={getProxiedUrl(streamSource.url, streamSource.headers?.['Referer'])} 
                        poster={anime?.images.jpg.large_image_url} 
                    />
                 ) : streamSource.url.includes('.mp4') ? (
                    <video 
                      key={streamSource.url}
                      src={getProxiedUrl(streamSource.url, streamSource.headers?.['Referer'])} 
                      controls 
                      autoPlay
                      poster={anime?.images.jpg.large_image_url}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={() => {
                          console.error("Video load error");
                      }}
                    />
                 ) : (
                    <iframe 
                      key={streamSource.url}
                      src={streamSource.url} 
                      width="100%" 
                      height="100%" 
                      allowFullScreen 
                      style={{border: 'none'}}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                 )
               ) : anime?.trailer?.embed_url ? (
                 <Box w="full" h="full">
                    <TrailerPlayer url={anime.trailer.embed_url} title={currentEpisode?.title || anime.title} />
                 </Box>
               ) : (
                 <Center h="full" bg="gray.900" color="white">
                   <VStack>
                     <Heading size="md">Video not available</Heading>
                     <Text>Stream not found for this episode.</Text>
                   </VStack>
                 </Center>
               )}
               
               {/* Skip Intro Button Overlay */}
               {showSkipIntro && (
                 <Button 
                   position="absolute" 
                   bottom="80px" 
                   right="20px" 
                   bg="rgba(0,0,0,0.7)" 
                   color="white" 
                   _hover={{ bg: "rgba(0,0,0,0.9)" }}
                   leftIcon={<SkipForward size={16} />}
                   onClick={() => {
                     setShowSkipIntro(false);
                     toast({ title: "Skipped Intro", status: "info", duration: 1000 });
                   }}
                 >
                   Skip Intro
                 </Button>
               )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={4}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          
          {/* Main Content */}
          <Box flex="1">
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
              <HStack spacing={3} align="center">
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<ArrowLeft size={16} />}
                  onClick={() => router.push(`/anime/${dbId}`)}
                >
                  Back to Details
                </Button>
                <VStack align="start" spacing={1}>
                  <Heading size="md" color={activeColor}>Episode {currentEpNum}</Heading>
                  <Text fontSize="sm" color="gray.500">{currentEpisode?.title || `Episode ${currentEpNum}`}</Text>
                </VStack>
              </HStack>
              
              <HStack>
                <IconButton 
                  aria-label="Previous" 
                  icon={<ArrowLeft size={20} />} 
                  isDisabled={currentEpNum <= 1}
                  onClick={handlePrevEpisode}
                />
                <IconButton 
                  aria-label="Next" 
                  icon={<ArrowRight size={20} />} 
                  isDisabled={currentEpNum >= (anime.episodes || episodes.length)}
                  onClick={handleNextEpisode}
                />
              </HStack>
            </Flex>

            {/* Controls & Servers */}
            <Box bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} mb={6}>
              <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={4}>
                <HStack spacing={4}>
                  <HStack>
                    <Monitor size={16} />
                    <Text fontSize="sm" fontWeight="bold">Server:</Text>
                  </HStack>
                  <Flex gap={2} wrap="wrap">
                    {availableServers.length > 0 ? availableServers.map((s, idx) => (
                      <Button 
                        key={idx} 
                        size="xs" 
                        variant={selectedServerObj?.serverName === s.serverName ? 'solid' : 'outline'}
                        colorScheme={selectedServerObj?.serverName === s.serverName ? 'pink' : 'gray'}
                        onClick={() => {
                            setSelectedServerObj(s);
                            setServer(s.serverName);
                            if (s.sources && s.sources.length > 0) {
                                setStreamSource(s.sources[0]);
                            }
                        }}
                      >
                        {s.serverName}
                      </Button>
                    )) : (
                        <Text fontSize="xs" color="gray.500">
                          {isStreamLoading ? 'Loading...' : 'No servers found'}
                        </Text>
                    )}
                  </Flex>
                </HStack>

                <HStack spacing={4}>
                   {/* Quality Dropdown */}
                   {selectedServerObj && selectedServerObj.sources && (
                       <Box w="auto" minW="120px">
                           <FilterMenu 
                             size="sm"
                             placeholder="Quality" 
                             value={streamSource?.url || ''} 
                             onChange={(val) => {
                                 const selected = selectedServerObj?.sources.find((s: AnimeSource) => s.url === val);
                                 if (selected) setStreamSource(selected);
                             }}
                             options={selectedServerObj.sources.map((s: AnimeSource, idx: number) => ({
                                   value: s.url,
                                   label: s.quality || `Quality ${idx + 1}`
                             }))}
                             showAllOption={false}
                           />
                       </Box>
                   )}

                   <Button 
                     leftIcon={<Download size={16} />} 
                     size="sm" 
                     colorScheme="green" 
                     variant="solid"
                     onClick={() => toast({ title: "Download Started", description: "Downloading 1080p version...", status: "success" })}
                   >
                     Download
                   </Button>

                   <FormControl display="flex" alignItems="center">
                     <FormLabel htmlFor="auto-next" mb="0" fontSize="sm">
                       Auto Next
                     </FormLabel>
                     <Switch id="auto-next" isChecked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
                   </FormControl>
                   
                   <HStack bg={controlBg} p={1} borderRadius="md">
                      <Button 
                        size="sm" 
                        variant={lang === 'sub' ? 'solid' : 'ghost'} 
                        colorScheme={lang === 'sub' ? 'pink' : 'gray'}
                        onClick={() => setLang('sub')}
                      >
                        SUB
                      </Button>
                      <Button 
                        size="sm" 
                        variant={lang === 'dub' ? 'solid' : 'ghost'} 
                        colorScheme={lang === 'dub' ? 'pink' : 'gray'}
                        onClick={() => setLang('dub')}
                      >
                        DUB
                      </Button>
                   </HStack>
                </HStack>
              </Flex>
              
              <Text fontSize="sm" color="gray.500">
                You are watching <b>{anime.title_english || anime.title} Episode {currentEpNum}</b> on {server} server. 
                If the video is not working, please try switching servers.
              </Text>
            </Box>

            {/* Comments Section */}
            <CommentSection />
          </Box>

          {/* Sidebar - Episode List */}
          <Box w={{ base: 'full', lg: '350px' }}>
             <Box bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                <Box p={3} borderBottomWidth="1px" borderColor={borderColor} bg={headerBg}>
                   <HStack justify="space-between">
                     <Heading size="sm">Episodes</Heading>
                     {availableEpisodes.length > 0 && (
                       <Badge colorScheme="purple" fontSize="0.6rem">
                         Provider: {Math.min(...availableEpisodes)}–{Math.max(...availableEpisodes)} ({availableEpisodes.length})
                       </Badge>
                     )}
                   </HStack>
                </Box>
                <Box maxH="600px" overflowY="auto" p={2} data-lenis-prevent>
                   <Flex wrap="wrap" gap={2}>
                      {episodes.length > 0 ? episodes.map((ep) => {
                        const isCurrent = ep.mal_id === currentEpNum;
                        const entry = getEntry(dbId, 'anime');
                        const isWatched = entry?.watchedEpisodes?.includes(ep.mal_id);
                        
                        // Check availability for airing anime
                        const isAiring = anime.airing || anime.status === 'Currently Airing';
                        const hasOverlap = availableEpisodes.length > 0
                          ? availableEpisodes.some((num) => episodes.some((e) => e.mal_id === num))
                          : false;
                        const isAvailable = availableEpisodes.length === 0
                          ? true
                          : (hasOverlap ? availableEpisodes.includes(ep.mal_id) : ep.mal_id <= availableEpisodes.length);
                        const isComingSoon = isAiring && !isAvailable && availableEpisodes.length > 0;

                        return (
                          <Button
                            key={ep.mal_id}
                            w="full"
                            justifyContent="space-between"
                            variant={isCurrent ? 'solid' : 'ghost'}
                            colorScheme={isCurrent ? 'pink' : 'gray'}
                            bg={isCurrent ? undefined : 'transparent'}
                            _hover={{ bg: isCurrent ? undefined : ghostHoverBg }}
                            onClick={() => {
                                if (!isComingSoon) {
                                  router.push(`/anime/${dbId}/watch?ep=${ep.mal_id}${animeId ? `&animeId=${animeId}` : ''}&title=${encodeURIComponent(anime.title)}`);
                                } else {
                                  toast({ title: "Coming Soon", description: "This episode hasn't aired on streaming servers yet.", status: "info" });
                                }
                            }}
                            h="auto"
                            py={2}
                            isDisabled={isComingSoon}
                            opacity={isComingSoon ? 0.6 : 1}
                          >
                            <HStack>
                              <Text fontWeight={isCurrent ? 'bold' : 'normal'}>{ep.mal_id}</Text>
                              <Text fontSize="sm" noOfLines={1} maxW="150px" fontWeight="normal" opacity={0.8}>
                                {ep.title}
                              </Text>
                            </HStack>
                            <HStack>
                              {isComingSoon && <Text fontSize="xs" color="pink.400" fontWeight="bold">COMING SOON</Text>}
                              {isAvailable && !isComingSoon && isAiring && <Text fontSize="xs" color="green.400" fontWeight="bold">AIRED</Text>}
                              {isWatched && <Check size={14} color="green" />}
                            </HStack>
                          </Button>
                        );
                      }) : (
                        <Text p={4} fontSize="sm" color="gray.500">No episodes found.</Text>
                      )}
                   </Flex>
                </Box>
             </Box>
          </Box>

        </Flex>
      </Container>
    </Box>
  );
}
