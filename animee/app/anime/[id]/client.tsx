'use client';

import { Box, Container, Grid, GridItem, Heading, Text, Image, Badge, Stack, Flex, Button, AspectRatio, Tabs, TabList, TabPanels, Tab, TabPanel, Icon, SimpleGrid, useColorModeValue, Skeleton, Progress, Menu, MenuButton, MenuList, MenuItem, useToast } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnimeFullById, getAnimeEpisodes, getAnimeRelations, getAnimeById, getMangaById, getAnimeRecommendations, JikanAnime, JikanEpisode, JikanRelation, JikanResource, JikanRecommendation } from '@/lib/anilist';
import { getStreamingAnime, getStreamingEpisodes } from '@/app/actions/anime';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Play, Star, Plus, Users, Heart, Trophy, Info, Film, BookOpen, Check, ChevronDown, Clock } from 'lucide-react';
import { useJournal } from '@/context/JournalContext';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chakra } from '@chakra-ui/react';
import TrailerPlayer from '@/components/TrailerPlayer';

const MotionBox = chakra(motion.div);
const MotionHeading = chakra(motion.h1);
// const MotionImage = chakra(motion.img);
// const MotionText = chakra(motion.p);

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const tabVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
};

// --- Components ---

const InfoCard = ({ anime, borderColor }: { anime: JikanAnime, borderColor: string }) => {
    const bg = useColorModeValue('white', 'whiteAlpha.50');
    return (
        <MotionBox variants={itemVariants} bg={bg} p={6} borderRadius="xl" border="1px solid" borderColor={borderColor}>
            <Stack spacing={4}>
                <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={1}>FORMAT</Text>
                    <Text fontWeight="medium">{anime.type} • {anime.episodes || '?'} eps</Text>
                </Box>
                <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={1}>STATUS</Text>
                    <Badge colorScheme={anime.status === 'Currently Airing' ? 'green' : 'gray'}>{anime.status}</Badge>
                </Box>
                <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={1}>SEASON</Text>
                    <Text fontWeight="medium" textTransform="capitalize">{anime.season} {anime.year}</Text>
                </Box>
                <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={1}>STUDIOS</Text>
                    <Text fontWeight="medium">{anime.studios?.map(s => s.name).join(', ') || '-'}</Text>
                </Box>
                <Box>
                    <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={1}>SOURCE</Text>
                    <Text fontWeight="medium">{anime.source}</Text>
                </Box>
            </Stack>
        </MotionBox>
    );
};

const AnimeTitle = ({ anime }: { anime: JikanAnime }) => {
    const subColor = useColorModeValue('gray.500', 'gray.400');
    const hoverColor = useColorModeValue('pink.500', 'pink.300');
    
    return (
        <>
        <MotionHeading 
            fontSize="3xl" 
            fontWeight="bold"
            mb={2} 
            lineHeight="1.1"
            initial={{ filter: "blur(10px)", opacity: 0, scale: 0.95 }}
            animate={{ 
                filter: "blur(0px)", 
                opacity: 1, 
                scale: 1, 
                transition: { duration: 0.8, ease: "easeOut" } 
            }}
            whileHover={{ scale: 1.01, color: hoverColor, originX: 0 }}
            cursor="default"
        >
            {anime.title_english || anime.title}
        </MotionHeading>
        {anime.title_english && anime.title !== anime.title_english && (
            <Text fontSize="xl" color={subColor} mb={4}>{anime.title}</Text>
        )}
        </>
    );
};

const GenreBadge = ({ genre }: { genre: { mal_id: number; name: string } }) => {
    const bg = useColorModeValue('gray.200', 'whiteAlpha.100');
    const color = useColorModeValue('gray.800', 'white');
    return (
        <Badge key={genre.mal_id} px={3} py={1} borderRadius="full" bg={bg} color={color} fontWeight="normal">
            {genre.name}
        </Badge>
    );
};

const Synopsis = ({ html }: { html: string }) => {
    const color = useColorModeValue('gray.700', 'gray.300');
    return (
        <Box 
            fontSize="lg" 
            lineHeight="1.8" 
            color={color}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => {
  const bg = useColorModeValue('white', 'whiteAlpha.50');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const valueColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.800', 'white');

  return (
  <MotionBox 
    variants={itemVariants}
    bg={bg} 
    p={4} 
    borderRadius="xl" 
    border="1px solid" 
    borderColor={borderColor}
    display="flex"
    alignItems="center"
    gap={4}
    _hover={{ bg: hoverBg, transform: 'translateY(-2px)', borderColor: color }}
    transition="all 0.2s"
  >
    <Flex 
      bg={`${color}20`} 
      p={3} 
      borderRadius="lg" 
      color={color}
      align="center"
      justify="center"
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Box>
      <Text fontSize="xs" color={labelColor} textTransform="uppercase" fontWeight="bold" letterSpacing="wider">{label}</Text>
      <Text fontSize="lg" fontWeight="bold" color={valueColor}>{value}</Text>
    </Box>
  </MotionBox>
)};

const EpisodeCard = ({ episode, animeId, isAvailable, isAiring, isComingSoon }: { episode: JikanEpisode, animeId: number, isAvailable: boolean, isAiring: boolean, isComingSoon: boolean }) => {
  const bg = useColorModeValue('white', 'whiteAlpha.50');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const titleColor = useColorModeValue('gray.800', 'white');
  const dateColor = useColorModeValue('gray.500', 'gray.500');

  // If Coming Soon, disable link or show toast on click (managed by parent or check link)
  // For simplicity here, we conditionally render Link

  const CardContent = (
      <Box 
        bg={bg} 
        borderRadius="lg" 
        overflow="hidden" 
        border="1px solid" 
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={!isComingSoon ? { borderColor: 'pink.400', bg: hoverBg } : undefined}
        h="full"
        opacity={isComingSoon ? 0.6 : 1}
        position="relative"
      >
        <Box position="relative" pt="56.25%" bg="blackAlpha.500">
            <CenterPosition>
                {isComingSoon ? (
                    <Clock size={32} color="white" opacity={0.7} />
                ) : (
                    <Icon as={Play} boxSize={8} color="whiteAlpha.800" />
                )}
            </CenterPosition>
            <Badge position="absolute" top={2} left={2} colorScheme="pink">EP {episode.mal_id}</Badge>
            
            {/* Status Tags */}
            {isComingSoon && <Badge position="absolute" bottom={2} right={2} colorScheme="pink">COMING SOON</Badge>}
            {isAvailable && isAiring && !isComingSoon && <Badge position="absolute" bottom={2} right={2} colorScheme="green">AIRED</Badge>}
        </Box>
        <Box p={3}>
            <Text fontSize="sm" fontWeight="bold" noOfLines={1} mb={1} color={titleColor}>{episode.title}</Text>
            <Text fontSize="xs" color={dateColor}>{episode.aired ? new Date(episode.aired).toLocaleDateString() : 'Unknown Date'}</Text>
        </Box>
      </Box>
  );

  if (isComingSoon) {
      return (
          <MotionBox variants={itemVariants} layout cursor="not-allowed">
              {CardContent}
          </MotionBox>
      );
  }

  return (
  <MotionBox 
    variants={itemVariants}
    layout
    whileHover={{ y: -4 }}
  >
    <Link href={`/anime/${animeId}/watch?ep=${episode.mal_id}`}>
       {CardContent}
    </Link>
  </MotionBox>
)};

const CenterPosition = ({ children }: { children: React.ReactNode }) => (
    <Flex position="absolute" inset={0} align="center" justify="center">
        {children}
    </Flex>
);

const RelatedCard = ({ mal_id, type, relation, title, images }: { mal_id: number, type: string, relation: string, title?: string, images?: { jpg?: { image_url?: string }, webp?: { image_url?: string } } }) => {
    const [item, setItem] = useState<JikanResource | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (title && images) {
          // Use provided data directly to avoid 404s on region-locked/hidden content
          setItem({ 
              mal_id, 
              title, 
              images: {
                  jpg: {
                      image_url: images?.jpg?.image_url || '',
                      small_image_url: images?.jpg?.image_url || '',
                      large_image_url: images?.jpg?.image_url || ''
                  },
                  webp: {
                      image_url: images?.webp?.image_url || '',
                      small_image_url: images?.webp?.image_url || '',
                      large_image_url: images?.webp?.image_url || ''
                  }
              },
              type, 
              status: 'Unknown', 
              score: 0, 
              scored_by: 0, 
              rank: 0, 
              popularity: 0, 
              members: 0, 
              favorites: 0, 
              synopsis: '', 
              background: '', 
              url: '',
              title_english: title,
              title_japanese: title,
              genres: [],
              explicit_genres: [],
              themes: [],
              demographics: []
           } as JikanResource);
          setLoading(false);
          return;
      }

      const fetchItem = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
          let data;
          if (type === 'manga') {
              const res = await getMangaById(mal_id);
              data = res.data;
          } else {
              const getAnime = async () => {
                  try {
                      return await getAnimeById(mal_id);
                  } catch (e) {
                      console.error(e);
                      return { data: null };
                  }
              }
              const res = await getAnime();
              data = res.data;
          }
          setItem(data);
        } catch (error) {
          console.error(`Failed to fetch related ${type} ${mal_id}`, error);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }, [mal_id, type, title, images]);
  
    if (loading) {
      return <Skeleton height="280px" borderRadius="lg" />;
    }
  
    if (!item) return null;

    return (
    <MotionBox 
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        position="relative"
    >
        <Link href={`/${type}/${item.mal_id}`}>
            <Box borderRadius="lg" overflow="hidden" position="relative" pt="145%">
                <Image 
                    src={item.images.jpg.large_image_url} 
                    alt={item.title} 
                    position="absolute" 
                    top={0} 
                    left={0} 
                    w="full" 
                    h="full" 
                    objectFit="cover" 
                />
                <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.900, transparent)" />
                <Box position="absolute" bottom={0} left={0} p={3}>
                    <Badge colorScheme="purple" fontSize="xs" mb={1}>{relation}</Badge>
                    <Text fontSize="sm" fontWeight="bold" color="white" noOfLines={2}>{item.title}</Text>
                    <Flex align="center" gap={1} mt={1}>
                        <Star size={10} fill="currentColor" color="#F6E05E" />
                        <Text fontSize="xs" fontWeight="bold" color="white">{item.score || 'N/A'}</Text>
                    </Flex>
                </Box>
            </Box>
        </Link>
    </MotionBox>
    );
};

export default function AnimeDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const titleParam = searchParams.get('title');
  const { addEntry, getEntry } = useJournal();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdded = !!getEntry(id, 'anime');
  const toast = useToast();
  
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
  const [relations, setRelations] = useState<JikanRelation[]>([]);
  const [recommendations, setRecommendations] = useState<JikanRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [availableEpisodes, setAvailableEpisodes] = useState<number[]>([]);

  const { seasons, relatedAnime, relatedManga } = useMemo(() => {
    const seasonsList: { mal_id: number; name: string; type: string; relation?: string }[] = [];
    const animeList: { mal_id: number; name: string; type: string; relation: string }[] = [];
    const mangaList: { mal_id: number; name: string; type: string; relation: string }[] = [];

    if (anime) {
        seasonsList.push({
            mal_id: anime.mal_id,
            name: anime.title,
            type: anime.type,
            relation: 'Current'
        });
    }

    relations.forEach(rel => {
      rel.entry.forEach(entry => {
        const isAnime = ['anime', 'movie', 'ova', 'special', 'ona', 'tv', 'music'].includes(entry.type.toLowerCase());
        
        if (isAnime) {
             if (!seasonsList.find(s => s.mal_id === entry.mal_id)) {
                 seasonsList.push({
                     mal_id: entry.mal_id,
                     name: entry.name,
                     type: entry.type,
                     relation: rel.relation
                 });
             }
             
             animeList.push({
                 mal_id: entry.mal_id,
                 name: entry.name,
                 type: entry.type,
                 relation: rel.relation
             });
        } else {
             const item = {
                 mal_id: entry.mal_id,
                 name: entry.name,
                 type: entry.type,
                 relation: rel.relation
             };
             mangaList.push(item);
        }
      });
    });

    seasonsList.sort((a, b) => a.mal_id - b.mal_id);

    return { seasons: seasonsList, relatedAnime: animeList, relatedManga: mangaList };
  }, [relations, anime]);

  // Theme Colors
  const bg = useColorModeValue('gray.50', 'black');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const bgFilter = useColorModeValue('blur(80px) opacity(0.5)', 'blur(80px) brightness(0.3)');
  const overlayBg = useColorModeValue('whiteAlpha.900', 'blackAlpha.600');
  const gradientBg = useColorModeValue(
    'linear(to-b, transparent 0%, gray.50 100%)',
    'linear(to-b, transparent 0%, black 100%)'
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Parallel Fetching
        const [animeRes, episodesRes, relationsRes, recommendationsRes] = await Promise.all([
            getAnimeFullById(id).catch(() => ({ data: null })),
            getAnimeEpisodes(id).catch(() => ({ data: [] })),
            getAnimeRelations(id).catch(() => ({ data: [] })),
            getAnimeRecommendations(id).catch(() => ({ data: [] }))
        ]);

        if (animeRes.data) {
            setAnime(animeRes.data);
            setEpisodes(episodesRes.data);
            setRelations(relationsRes.data);
            setRecommendations(recommendationsRes.data || []);

            // Streaming ID Fetch
            const streamRes = await getStreamingAnime(animeRes.data.title);
            if (streamRes.success && streamRes.data?.animeId) {
                setStreamingId(streamRes.data.animeId);
                const epRes = await getStreamingEpisodes(streamRes.data.animeId, animeRes.data.title);
                if (epRes.success && epRes.data) {
                    setAvailableEpisodes(epRes.data.map((e) => Number(e.number)));
                }
            }
        } else if (titleParam) {
            // Fallback Logic
             const streamRes = await getStreamingAnime(titleParam);
             if (streamRes.success && streamRes.data?.details) {
                 const details = streamRes.data.details;
                 setAnime({
                     mal_id: id,
                     title: details.title,
                     title_english: details.title,
                     images: { 
                       jpg: { large_image_url: details.image || '', image_url: details.image || '', small_image_url: '' },
                       webp: { large_image_url: details.image || '', image_url: details.image || '', small_image_url: '' }
                     },
                     synopsis: 'Synopsis unavailable.',
                     type: 'TV',
                     status: 'Unknown',
                     score: 0,
                     year: 0,
                     genres: [],
                     studios: [],
                     aired: { 
                       string: 'Unknown',
                       from: '',
                       to: '',
                       prop: {
                         from: { day: 0, month: 0, year: 0 },
                         to: { day: 0, month: 0, year: 0 }
                       }
                     },
                     trailer: { 
                       embed_url: '',
                       url: '',
                       youtube_id: '',
                       images: {
                         image_url: '',
                         small_image_url: '',
                         medium_image_url: '',
                         large_image_url: '',
                         maximum_image_url: ''
                       }
                     },
                     duration: 'Unknown',
                     rating: 'Unknown',
                     source: 'Unknown',
                     rank: 0,
                     popularity: 0,
                     members: 0,
                     favorites: 0,
                     season: '',
                     broadcast: { string: '', day: '', time: '', timezone: '' },
                     producers: [],
                     licensors: [],
                     background: '',
                     url: '',
                     title_japanese: '',
                     scored_by: 0,
                     explicit_genres: [],
                     themes: [],
                     demographics: [],
                     episodes: 0,
                     airing: false
                 } as unknown as JikanAnime);
                 
                 if (streamRes.data.animeId) {
                    setStreamingId(streamRes.data.animeId);
                    const epRes = await getStreamingEpisodes(streamRes.data.animeId, details.title);
                    if (epRes.success && epRes.data) {
                        setAvailableEpisodes(epRes.data.map((e) => Number(e.number)));
                    }
                 }
             }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, titleParam]);

  if (!mounted) return null;

  if (loading) return (
    <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Stack align="center" spacing={4}>
            <Progress size="xs" isIndeterminate w="200px" colorScheme="pink" borderRadius="full" />
            <Text color="gray.500" fontSize="sm" letterSpacing="widest">LOADING DATA</Text>
        </Stack>
    </Box>
  );

  if (!anime) return null;

  return (
    <Box bg={bg} minH="100vh" color={textColor} overflowX="hidden">
      <Navbar />
      
      {/* --- Cinematic Background --- */}
      <Box position="fixed" inset={0} zIndex={0}>
        <Image 
            src={anime.images.jpg.large_image_url} 
            alt="bg" 
            w="full" 
            h="full" 
            objectFit="cover" 
            filter={bgFilter} 
            transform="scale(1.2)"
        />
        <Box position="absolute" inset={0} bg={overlayBg} />
        <Box position="absolute" inset={0} bgGradient={gradientBg} />
      </Box>

      <Container maxW="8xl" position="relative" zIndex={1} pt={{ base: 24, md: 32 }} pb={20}>
        <MotionBox 
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <Grid templateColumns={{ base: '1fr', lg: '350px 1fr' }} gap={12}>
                
                {/* --- Left Sidebar (Sticky) --- */}
                <GridItem>
                    <Box position={{ lg: 'sticky' }} top={24}>
                        <MotionBox variants={itemVariants} whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
                            <Image 
                                src={anime.images.jpg.large_image_url} 
                                alt={anime.title} 
                                borderRadius="2xl" 
                                boxShadow="0 20px 40px -10px rgba(0,0,0,0.7)"
                                w="full"
                                mb={6}
                            />
                        </MotionBox>

                        <Stack spacing={4} mb={8}>
                            <Button 
                                as={Link}
                                href={streamingId ? `/anime/${id}/watch?animeId=${streamingId}&title=${encodeURIComponent(anime.title)}` : '#'}
                                size="lg" 
                                colorScheme="pink" 
                                h={14}
                                fontSize="lg"
                                leftIcon={<Play fill="currentColor" />}
                                isDisabled={!streamingId}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                            >
                                {streamingId ? 'Start Watching' : 'Unavailable'}
                            </Button>
                            
                            <Grid templateColumns="1fr 1fr" gap={3}>
                                <Button 
                                    h={12}
                                    variant={isAdded ? "solid" : "outline"}
                                    colorScheme={isAdded ? "green" : undefined}
                                    borderColor={isAdded ? undefined : borderColor}
                                    color={isAdded ? "white" : textColor}
                                    _hover={!isAdded ? { bg: menuHoverBg, borderColor: textColor } : undefined}
                                    leftIcon={isAdded ? <Check /> : <Plus />}
                                    isDisabled={isAdded}
                                    onClick={() => {
                                        if (isAdded) return;
                                        addEntry({
                                            type: 'anime',
                                            animeId: anime.mal_id,
                                            title: anime.title_english || anime.title,
                                            episode: 0,
                                            status: 'Plan to Watch',
                                            rating: 0,
                                            image: anime.images.jpg.image_url
                                        });
                                    }}
                                >
                                    {isAdded ? "Tracking" : "Track"}
                                </Button>
                                <Button 
                                    h={12}
                                    variant="outline" 
                                    borderColor={borderColor} 
                                    color={textColor}
                                    _hover={{ bg: menuHoverBg, borderColor: textColor }}
                                    leftIcon={<Heart />}
                                    onClick={() => {
                                        toast({
                                            title: "Added to Favorites",
                                            description: `${anime.title} has been added to your favorites.`,
                                            status: "success",
                                            duration: 3000,
                                            isClosable: true,
                                        });
                                    }}
                                >
                                    Favorite
                                </Button>
                            </Grid>
                        </Stack>

                        <InfoCard anime={anime} borderColor={borderColor} />
                    </Box>
                </GridItem>

                {/* --- Main Content --- */}
                <GridItem>
                  <Stack spacing={8}>
                    <Box>
                      <AnimeTitle anime={anime} />
                      <Flex wrap="wrap" gap={2} mt={4}>
                        {anime.genres.map((genre, i) => <GenreBadge key={`${genre.mal_id}-${i}`} genre={genre} />)}
                      </Flex>
                    </Box>

                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                      <StatCard icon={Star} label="Score" value={anime.score || 'N/A'} color="#F6E05E" />
                      <StatCard icon={Users} label="Rank" value={`#${anime.rank || 'N/A'}`} color="#F56565" />
                      <StatCard icon={Trophy} label="Popularity" value={`#${anime.popularity || 'N/A'}`} color="#4299E1" />
                      <StatCard icon={Heart} label="Members" value={(anime.members || 0).toLocaleString()} color="#ED64A6" />
                    </SimpleGrid>

                    <Tabs variant="soft-rounded" colorScheme="pink" isLazy>
                        <TabList mb={6} gap={4} overflowX="auto" py={2}>
                            <Tab _selected={{ bg: 'pink.400', color: 'white' }}>Overview</Tab>
                            <Tab _selected={{ bg: 'pink.400', color: 'white' }}>Episodes</Tab>
                            <Tab _selected={{ bg: 'pink.400', color: 'white' }}>Relations</Tab>
                            <Tab _selected={{ bg: 'pink.400', color: 'white' }}>Similar</Tab>
                        </TabList>

                        <TabPanels>
                            {/* Overview */}
                            <TabPanel p={0}>
                                <AnimatePresence mode="wait">
                                    <MotionBox 
                                        variants={tabVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Box mb={10}>
                                            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
                                                <Icon as={Info} /> Synopsis
                                            </Heading>
                                            <Synopsis html={anime.synopsis || "No synopsis available."} />
                                        </Box>

                                        {anime.trailer.embed_url && (
                                            <Box mb={10}>
                                                <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
                                                    <Icon as={Film} /> Trailer
                                                </Heading>
                                                <AspectRatio ratio={16/9} borderRadius="xl" overflow="hidden" boxShadow="xl">
                                                    <TrailerPlayer url={anime.trailer.embed_url} title="Trailer" />
                                                </AspectRatio>
                                            </Box>
                                        )}
                                    </MotionBox>
                                </AnimatePresence>
                            </TabPanel>

                            {/* Episodes */}
                            <TabPanel p={0}>
                                <MotionBox variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                    <Flex justify="space-between" align="center" mb={6}>
                                        <Heading size="md">Episodes ({episodes.length})</Heading>
                                        {seasons.length > 1 && (
                                            <Menu>
                                                <MenuButton as={Button} rightIcon={<ChevronDown />} size="sm" colorScheme="pink" variant="outline">
                                                    {seasons.find(s => s.mal_id === id)?.name || 'Select Season'}
                                                </MenuButton>
                                                <MenuList bg={menuBg} borderColor={borderColor} zIndex={10}>
                                                    {seasons.map((season, i) => (
                                                        <MenuItem 
                                                            key={`${season.mal_id}-${i}`} 
                                                            bg={menuBg} 
                                                            _hover={{ bg: menuHoverBg }}
                                                            as={Link}
                                                            href={`/anime/${season.mal_id}?title=${encodeURIComponent(season.name)}`}
                                                        >
                                                            {season.name} ({season.type})
                                                        </MenuItem>
                                                    ))}
                                                </MenuList>
                                            </Menu>
                                        )}
                                    </Flex>
                                    
                                    {episodes.length > 0 ? (
                                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
                                            {episodes.map((ep, i) => {
                                                const isAiring = anime?.airing || anime?.status === 'Currently Airing';
                                                                                                const hasOverlap = availableEpisodes.length > 0
                                                                                                    ? availableEpisodes.some((num) => episodes.some((e) => e.mal_id === num))
                                                                                                    : false;
                                                                                                const isAvailable = availableEpisodes.length === 0
                                                                                                    ? true
                                                                                                    : (hasOverlap ? availableEpisodes.includes(ep.mal_id) : ep.mal_id <= availableEpisodes.length);
                                                                                                const isComingSoon = isAiring && !isAvailable && availableEpisodes.length > 0;
                                                
                                                return (
                                                    <EpisodeCard 
                                                        key={`${ep.mal_id}-${i}`} 
                                                        episode={ep} 
                                                        animeId={id} 
                                                        isAvailable={isAvailable}
                                                        isAiring={Boolean(isAiring)}
                                                        isComingSoon={isComingSoon}
                                                    />
                                                );
                                            })}
                                        </SimpleGrid>
                                    ) : (
                                        <Text color="gray.500">No episodes found.</Text>
                                    )}
                                </MotionBox>
                            </TabPanel>

                            {/* Relations */}
                            <TabPanel p={0}>
                                <MotionBox variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                    <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={10}>
                                        {/* Anime Column */}
                                        <GridItem>
                                            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                                                <Icon as={Film} /> Related Anime
                                            </Heading>
                                            {relatedAnime.length > 0 ? (
                                                <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                                                    {relatedAnime.map(item => (
                                                        <RelatedCard 
                                                            key={`${item.mal_id}-${item.relation}`} 
                                                            mal_id={item.mal_id} 
                                                            type={item.type}
                                                            relation={item.relation}
                                                            title={item.name}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                            ) : (
                                                <Text color="gray.500">No related anime found.</Text>
                                            )}
                                        </GridItem>

                                        {/* Manga Column */}
                                        <GridItem>
                                            <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                                                <Icon as={BookOpen} /> Related Manga
                                            </Heading>
                                            {relatedManga.length > 0 ? (
                                                <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                                                    {relatedManga.map(item => (
                                                        <RelatedCard 
                                                            key={`${item.mal_id}-${item.relation}`} 
                                                            mal_id={item.mal_id} 
                                                            type={item.type}
                                                            relation={item.relation}
                                                            title={item.name}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                            ) : (
                                                <Text color="gray.500">No related manga found.</Text>
                                            )}
                                        </GridItem>
                                    </Grid>
                                </MotionBox>
                            </TabPanel>

                            {/* Similar */}
                            <TabPanel p={0}>
                                <MotionBox variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                    <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                                        <Icon as={Film} /> Similar Anime
                                    </Heading>
                                    {recommendations.length > 0 ? (
                                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
                                            {recommendations.slice(0, 15).map(item => (
                                                <MotionBox 
                                                    key={item.entry.mal_id}
                                                    variants={itemVariants}
                                                    whileHover={{ scale: 1.05 }}
                                                    position="relative"
                                                >
                                                    <Link href={`/anime/${item.entry.mal_id}`}>
                                                        <Box borderRadius="lg" overflow="hidden" position="relative" pt="145%">
                                                            <Image 
                                                                src={item.entry.images.jpg.large_image_url} 
                                                                alt={item.entry.title} 
                                                                position="absolute" 
                                                                top={0} 
                                                                left={0} 
                                                                w="full" 
                                                                h="full" 
                                                                objectFit="cover" 
                                                            />
                                                            <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.900, transparent)" />
                                                            <Box position="absolute" bottom={0} left={0} p={3}>
                                                                <Text fontSize="sm" fontWeight="bold" color="white" noOfLines={2}>{item.entry.title}</Text>
                                                            </Box>
                                                        </Box>
                                                    </Link>
                                                </MotionBox>
                                            ))}
                                        </SimpleGrid>
                                    ) : (
                                        <Text color="gray.500">No similar anime found.</Text>
                                    )}
                                </MotionBox>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                  </Stack>
                </GridItem>
            </Grid>
        </MotionBox>
      </Container>
      <Footer />
    </Box>
  );
}

