'use client';

import { Box, Container, Heading, SimpleGrid, Text, Button, Flex, Image, Badge, IconButton, Progress, useColorModeValue, Skeleton, SkeletonText, HStack, Grid, GridItem, VStack } from '@chakra-ui/react';
import { getTopAnime, getSeasonNow, getSeasonUpcoming, getRandomAnime, getAnimeGenres, searchAnime, JikanAnime } from '@/lib/anilist';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Clock, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Calendar, TrendingUp, Shuffle, Filter } from 'lucide-react';
import Link from 'next/link';
import { useJournal } from '@/context/JournalContext';
import { getRecentStreamingEpisodes } from '@/app/actions/anime';
import { AnimeResult } from '@/lib/consumet';
import { useState, useEffect } from 'react';
import { SlideUpFade } from './TextAnimations';
import { FilterMenu } from './FilterMenu';

// --- Helper Components ---

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const SectionHeader = ({ title, subtitle, href, icon, rightElement }: { title: string, subtitle?: string, href?: string, icon?: React.ReactNode, rightElement?: React.ReactNode }) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.800', 'white');
  
  return (
  <Flex justify="space-between" align="end" mb={6}>
    <Box>
      <Flex align="center" gap={2} mb={1}>
        {icon && <Box color="pink.500">{icon}</Box>}
        <SlideUpFade size="lg" color={titleColor}>{title}</SlideUpFade>
      </Flex>
      {subtitle && <Text color={subtitleColor} fontSize="sm">{subtitle}</Text>}
    </Box>
    <HStack spacing={4}>
      {rightElement}
      {href && (
        <Button as={Link} href={href} variant="ghost" colorScheme="pink" size="sm" rightIcon={<ChevronRight size={16} />}>
          View All
        </Button>
      )}
    </HStack>
  </Flex>
)};

const AnimeCardVertical = ({ anime, rank }: { anime: JikanAnime, rank?: number }) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.800', 'white');
  
  return (
  <Link href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
    <MotionBox
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      cursor="pointer"
      role="group"
      h="100%"
    >
      <Box position="relative" borderRadius="lg" overflow="hidden" mb={3} h="320px">
        {/* Sheen Effect */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.2) 45%, transparent 50%)"
          transform="translateX(-100%)"
          transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          _groupHover={{ transform: "translateX(100%)" }}
          pointerEvents="none"
          zIndex={2}
        />
        <Image 
          src={anime.images.jpg.large_image_url || undefined} 
          alt={anime.title} 
          objectFit="cover" 
          h="100%" 
          w="100%" 
          transition="transform 0.3s"
          _groupHover={{ transform: 'scale(1.05)' }}
          fallbackSrc="https://placehold.co/225x320?text=No+Image"
        />
        <Box 
          position="absolute" 
          top={0} left={0} right={0} bottom={0} 
          bg="blackAlpha.600" 
          opacity={0} 
          transition="opacity 0.2s"
          _groupHover={{ opacity: 1 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <IconButton 
            aria-label="Play" 
            icon={<Play fill="white" />} 
            isRound 
            colorScheme="pink" 
            size="lg"
          />
        </Box>
        {rank && (
            <Box 
                position="absolute" 
                top={0} 
                left={0} 
                bg="pink.500" 
                color="white" 
                px={3} 
                py={1} 
                borderBottomRightRadius="lg"
                fontWeight="bold"
                fontSize="lg"
            >
                #{rank}
            </Box>
        )}
        <Badge position="absolute" top={2} right={2} colorScheme="yellow" display="flex" alignItems="center" gap={1}>
          <Star size={12} fill="currentColor" /> {anime.score || 'N/A'}
        </Badge>
      </Box>
      <Heading size="sm" color={titleColor} noOfLines={1} fontFamily="body">{anime.title_english || anime.title}</Heading>
      <Text fontSize="xs" color={subtitleColor}>
        {anime.type} • {anime.episodes || '?'} eps
      </Text>
    </MotionBox>
  </Link>
)};

const AnimeCardHorizontal = ({ anime }: { anime: JikanAnime }) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.800', 'white');
  
  return (
  <Link href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
    <Box
      cursor="pointer"
      role="group"
      minW="240px"
      maxW="240px"
    >
      <Box
        transition="transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
        _groupHover={{ transform: 'translate3d(0, -8px, 0)' }}
        willChange="transform"
      >
        <Box 
            position="relative" 
            borderRadius="lg" 
            overflow="hidden" 
            mb={3} 
            h="320px"
            transform="translateZ(0)"
        >
          {/* Sheen Effect */}
          <Box
            position="absolute"
            inset={0}
            bg="linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 45%, transparent 50%)"
            transform="translateX(-100%)"
            transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            _groupHover={{ transform: "translateX(100%)" }}
            pointerEvents="none"
            zIndex={2}
          />
          <Image 
            src={anime.images.jpg.large_image_url || undefined} 
            alt={anime.title} 
            objectFit="cover" 
            h="100%" 
            w="100%" 
            transition="transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
            _groupHover={{ transform: 'scale(1.08)' }}
            fallbackSrc="https://placehold.co/240x320?text=No+Image"
            transform="translateZ(0)"
          />
          <Box 
            position="absolute" 
            top={0} left={0} right={0} bottom={0} 
            bg="blackAlpha.600" 
            opacity={0} 
            transition="opacity 0.3s ease"
            _groupHover={{ opacity: 1 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            backdropFilter="blur(2px)"
          >
            <IconButton 
              aria-label="Play" 
              icon={<Play fill="white" />} 
              isRound 
              colorScheme="pink" 
              size="lg"
              _hover={{ transform: "scale(1.1)" }}
            />
          </Box>
          <Badge position="absolute" top={2} right={2} colorScheme="yellow" display="flex" alignItems="center" gap={1} boxShadow="md">
            <Star size={12} fill="currentColor" /> {anime.score || 'N/A'}
          </Badge>
        </Box>
        <Heading size="sm" color={titleColor} noOfLines={1} transition="color 0.2s" _groupHover={{ color: "pink.400" }}>{anime.title_english || anime.title}</Heading>
        <Text fontSize="xs" color={subtitleColor}>
          {anime.type} • {anime.episodes || '?'} eps
        </Text>
      </Box>
    </Box>
  </Link>
)};

const AnimeCardMinimal = ({ anime }: { anime: JikanAnime }) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.800', 'white');
  
  return (
  <Link href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
    <Box
      cursor="pointer"
      role="group"
      w="100%"
    >
      <Box
        transition="transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
        _groupHover={{ transform: 'translate3d(0, -8px, 0)' }}
        willChange="transform"
      >
        <Box 
            position="relative" 
            borderRadius="lg" 
            overflow="hidden" 
            mb={3}
            transform="translateZ(0)" // GPU acceleration hack
        >
          {/* Sheen Effect */}
          <Box
            position="absolute"
            inset={0}
            bg="linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 45%, transparent 50%)"
            transform="translateX(-100%)"
            transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            _groupHover={{ transform: "translateX(100%)" }}
            pointerEvents="none"
            zIndex={2}
          />
          <Image 
            src={anime.images.jpg.large_image_url || undefined} 
            alt={anime.title} 
            objectFit="cover" 
            h="320px" 
            w="100%" 
            transition="transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
            _groupHover={{ transform: 'scale(1.08)' }}
            fallbackSrc="https://placehold.co/240x320?text=No+Image"
            transform="translateZ(0)"
          />
          <Box 
            position="absolute" 
            top={0} left={0} right={0} bottom={0} 
            bg="blackAlpha.600" 
            opacity={0} 
            transition="opacity 0.3s ease"
            _groupHover={{ opacity: 1 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            backdropFilter="blur(2px)"
          >
            <IconButton 
              aria-label="Play" 
              icon={<Play fill="white" />} 
              isRound 
              colorScheme="pink" 
              size="lg"
              _hover={{ transform: "scale(1.1)" }}
            />
          </Box>
          <Badge position="absolute" top={2} right={2} colorScheme="yellow" display="flex" alignItems="center" gap={1} boxShadow="md">
            <Star size={12} fill="currentColor" /> {anime.score || 'N/A'}
          </Badge>
          <Badge position="absolute" top={2} left={2} colorScheme="pink" boxShadow="md">
            {anime.type}
          </Badge>
        </Box>
        <Heading size="sm" color={titleColor} noOfLines={1} transition="color 0.2s" _groupHover={{ color: "pink.400" }}>{anime.title_english || anime.title}</Heading>
        <Text fontSize="xs" color={subtitleColor}>
          {anime.studios?.[0]?.name || 'Unknown Studio'} {anime.year || 'Unknown'}
        </Text>
      </Box>
    </Box>
  </Link>
)};

// --- Sections ---

export const ContinueWatchingSection = () => {
  const { entries } = useJournal();
  const watching = entries.filter(e => e.status === 'Watching' || (e.progress && e.progress > 0));
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('pink.600', 'pink.300');

  if (watching.length === 0) return null;

  return (
    <Box py={10} bg={bg}>
      <Container maxW="7xl">
        <SectionHeader title="Continue Watching" subtitle="Pick up where you left off" href="/journal" icon={<Play size={24} />} />
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
           {watching.slice(0, 4).map(entry => (
             <Link key={entry.id} href={`/anime/${entry.animeId}/watch?ep=${entry.episode}`}>
               <MotionBox
                 whileHover={{ y: -5 }}
                 transition={{ duration: 0.2 }}
                 cursor="pointer"
                 bg={cardBg}
                 p={3}
                 borderRadius="xl"
                 boxShadow="sm"
                 display="flex"
                 gap={4}
                 alignItems="center"
               >
                 <Box position="relative" borderRadius="lg" overflow="hidden" h="80px" w="60px" flexShrink={0}>
                   <Image 
                     src={entry.image || undefined} 
                     alt={entry.title} 
                     objectFit="cover" 
                     h="100%" 
                     w="100%" 
                     fallbackSrc="https://placehold.co/60x80?text=No+Image"
                   />
                 </Box>
                 <Box flex={1} overflow="hidden">
                    <Heading size="xs" color={titleColor} noOfLines={1} mb={1}>{entry.title}</Heading>
                    <Text fontSize="xs" color={subtitleColor} mb={2}>Episode {entry.episode}</Text>
                    <Progress value={40} size="xs" colorScheme="pink" borderRadius="full" />
                 </Box>
                 <IconButton 
                    aria-label="Play" 
                    icon={<Play fill="currentColor" size={12} />} 
                    isRound 
                    colorScheme="pink" 
                    size="sm"
                    variant="ghost"
                 />
               </MotionBox>
             </Link>
           ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export const SeasonalSection = () => {
  const [seasonal, setSeasonal] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSeasonal = async () => {
      try {
        const res = await getSeasonNow({ limit: 25 });
        setSeasonal(res.data);
      } catch (error) {
        console.error('Error fetching seasonal anime:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasonal();
  }, []);

  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(seasonal.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Chunking for slider
  const slides = [];
  if (!loading && seasonal.length > 0) {
      for (let i = 0; i < seasonal.length; i += itemsPerSlide) {
          slides.push(seasonal.slice(i, i + itemsPerSlide));
      }
  } else if (loading) {
      slides.push([]); // Placeholder for skeleton
  }
  
  return (
    <Box py={10}>
      <Container maxW="7xl">
        <SectionHeader 
          title="This Season" 
          subtitle="Currently airing hits" 
          href="/library?status=airing" 
          icon={<Calendar size={24} />} 
          rightElement={
            !loading && totalSlides > 1 && (
              <HStack spacing={2}>
                <IconButton 
                  aria-label="Previous slide" 
                  icon={<ChevronLeft size={20} />} 
                  onClick={prevSlide}
                  size="sm"
                  variant="ghost"
                  isRound
                />
                <IconButton 
                  aria-label="Next slide" 
                  icon={<ChevronRight size={20} />} 
                  onClick={nextSlide}
                  size="sm"
                  variant="ghost"
                  isRound
                />
              </HStack>
            )
          }
        />
        
        {/* Featured Grid Layout with Slider */}
        <Box overflow="hidden">
            <MotionFlex 
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                w="100%"
            >
                {loading ? (
                    <Box minW="100%" px={1}>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                            {Array(5).fill(0).map((_, i) => (
                                <GridItem key={i} colSpan={i === 0 ? { base: 1, md: 2 } : 1} rowSpan={i === 0 ? { base: 1, md: 2 } : 1}>
                                    <Skeleton height="100%" borderRadius="lg" minH={i === 0 ? "400px" : "200px"} />
                                </GridItem>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    slides.map((slideItems, slideIndex) => (
                        <Box key={slideIndex} minW="100%" px={1}>
                            <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
                                {slideItems.map((anime, i) => (
                                    <GridItem key={anime.mal_id} colSpan={i === 0 ? { base: 1, md: 2 } : 1} rowSpan={i === 0 ? { base: 1, md: 2 } : 1}>
                                        <Link href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
                                            <MotionBox
                                                whileHover={{ scale: 1.02 }}
                                                transition={{ duration: 0.2 }}
                                                cursor="pointer"
                                                h="100%"
                                                position="relative"
                                                borderRadius="xl"
                                                overflow="hidden"
                                                role="group"
                                            >
                                                <Image 
                                                    src={anime.images.jpg.large_image_url || undefined} 
                                                    alt={anime.title} 
                                                    objectFit="cover" 
                                                    h="100%" 
                                                    w="100%" 
                                                    fallbackSrc="https://placehold.co/400x600?text=No+Image"
                                                />
                                                <Box 
                                                    position="absolute" 
                                                    bottom={0} left={0} right={0} 
                                                    bgGradient="linear(to-t, blackAlpha.900, transparent)"
                                                    p={6}
                                                    pt={20}
                                                >
                                                    <Heading size={i === 0 ? "md" : "sm"} color="white" noOfLines={2} mb={1}>
                                                        {anime.title_english || anime.title}
                                                    </Heading>
                                                    <HStack spacing={2}>
                                                        <Badge colorScheme="pink">{anime.type}</Badge>
                                                        <Badge colorScheme="yellow" display="flex" alignItems="center" gap={1}>
                                                            <Star size={10} fill="currentColor" /> {anime.score || 'N/A'}
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                            </MotionBox>
                                        </Link>
                                    </GridItem>
                                ))}
                            </Grid>
                        </Box>
                    ))
                )}
            </MotionFlex>
        </Box>
      </Container>
    </Box>
  );
};

export const TopAiringSection = () => {
  const [topAiring, setTopAiring] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for down, -1 for up
  const bg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const inactiveTextColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchTopAiring = async () => {
      try {
        const res = await getTopAnime({ filter: 'airing', limit: 20 });
        setTopAiring(res.data);
      } catch (error) {
        console.error('Error fetching top airing anime:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopAiring();
  }, []);

  const itemsPerSlide = 4;
  const slides = [];
  if (!loading && topAiring.length > 0) {
    for (let i = 0; i < topAiring.length; i += itemsPerSlide) {
      slides.push(topAiring.slice(i, i + itemsPerSlide));
    }
  }

  const handleSlideChange = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <Box py={10} bg={bg} position="relative">
      <Container maxW="7xl">
        <SectionHeader 
          title="Top Airing" 
          subtitle="The best of what's on now" 
          href="/library?status=airing&sort=score" 
          icon={<TrendingUp size={24} />} 
        />
        
        <Box h="360px" overflow="hidden" position="relative" mb={8}>
          <AnimatePresence mode="popLayout" custom={direction}>
            {loading ? (
              <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={6} key="skeleton">
                {Array(4).fill(0).map((_, i) => (
                  <GridItem key={i}>
                    <Skeleton height="320px" borderRadius="lg" mb={3} />
                    <SkeletonText noOfLines={2} spacing="4" />
                  </GridItem>
                ))}
              </Grid>
            ) : (
              <MotionBox
                key={currentIndex}
                custom={direction}
                initial={{ y: direction > 0 ? 100 : -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: direction > 0 ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                position="absolute"
                w="100%"
              >
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={6}>
                  {slides[currentIndex]?.map((anime, index) => (
                    <GridItem key={anime.mal_id}>
                      <AnimeCardVertical anime={anime} rank={(currentIndex * 4) + index + 1} />
                    </GridItem>
                  ))}
                </Grid>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Bottom Navigation Tabs */}
        {!loading && slides.length > 0 && (
          <Flex justify="flex-start" gap={8} borderTop="1px solid" borderColor="whiteAlpha.200" pt={4}>
            {slides.map((_, index) => (
              <Box 
                key={index} 
                position="relative" 
                cursor="pointer" 
                onClick={() => handleSlideChange(index)}
                pb={2}
              >
                <Text 
                  fontSize="sm" 
                  fontWeight="bold" 
                  color={currentIndex === index ? "pink.400" : inactiveTextColor}
                  transition="color 0.3s"
                >
                  0{index + 1} <Box as="span" ml={2} fontWeight="normal" color={inactiveTextColor}>Set {index + 1}</Box>
                </Text>
                {currentIndex === index && (
                  <MotionBox
                    layoutId="activeTab"
                    position="absolute"
                    bottom="-1px" // Align with borderTop of container
                    left={0}
                    right={0}
                    height="2px"
                    bg="pink.400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Box>
            ))}
          </Flex>
        )}
      </Container>
    </Box>
  );
};

export const MostPopularSection = () => {
  const [popular, setPopular] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await getTopAnime({ filter: 'bypopularity', limit: 15 });
        setPopular(res.data);
      } catch (error) {
        console.error('Error fetching popular anime:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);
  
  return (
    <Box py={10}>
      <Container maxW="7xl">
        <SectionHeader title="All Time Popular" subtitle="Community favorites" href="/library?sort=popularity" icon={<Star size={24} />} />
      </Container>
      
      <Box 
        overflowX="auto" 
        pb={4} 
        w="100vw"
        ml="calc(50% - 50vw)"
        px={{ base: 4, md: 6, xl: 8 }}
        css={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(236, 72, 153, 0.55) transparent',
          '&::-webkit-scrollbar': {
            height: '5px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(236, 72, 153, 0.55)',
            borderRadius: '999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(236, 72, 153, 0.85)',
          },
        }}
      >
        <HStack spacing={{ base: 5, md: 6 }} minW="max-content" alignItems="stretch">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <Box key={i} minW="240px">
                <Skeleton height="320px" borderRadius="lg" mb={3} />
                <SkeletonText noOfLines={2} spacing="4" />
              </Box>
            ))
          ) : (
            popular.map(anime => (
              <Box key={anime.mal_id} minW="240px" maxW="240px">
                <AnimeCardMinimal anime={anime} />
              </Box>
            ))
          )}
        </HStack>
      </Box>
    </Box>
  );
};

export const RandomAnimeSection = () => {
    const [anime, setAnime] = useState<JikanAnime | null>(null);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState<{ mal_id: number; name: string }[]>([]);
    const [selectedGenre, setSelectedGenre] = useState('');

    const bg = useColorModeValue('pink.50', 'gray.800');
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const selectBg = useColorModeValue('white', 'gray.700');

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await getAnimeGenres();
                // Sort by name
                const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setGenres(sorted);
            } catch (error) {
                console.error("Failed to fetch genres", error);
            }
        };
        fetchGenres();
    }, []);

    const fetchRandom = async () => {
        setLoading(true);
        try {
            let resultAnime: JikanAnime;

            if (selectedGenre) {
                // Genre selected: Fetch popular anime from that genre (random page 1-5)
                const randomPage = Math.floor(Math.random() * 5) + 1;
                const res = await searchAnime({
                    genres: selectedGenre,
                    order_by: 'popularity',
                    page: randomPage,
                    limit: 25 // Get a full page to pick from
                });
                
                if (res.data && res.data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * res.data.length);
                    resultAnime = res.data[randomIndex];
                } else {
                    // Fallback if no results (unlikely for top 5 pages of popular genres)
                    const fallback = await getRandomAnime();
                    resultAnime = fallback.data;
                }
            } else {
                // "All" selected: 70% chance of popular, 30% chance of true random
                const isPopularRoll = Math.random() < 0.7;
                
                if (isPopularRoll) {
                    // Fetch from top anime (random page 1-10)
                    const randomPage = Math.floor(Math.random() * 10) + 1;
                    const res = await getTopAnime({ page: randomPage, limit: 25 });
                    
                    if (res.data && res.data.length > 0) {
                        const randomIndex = Math.floor(Math.random() * res.data.length);
                        resultAnime = res.data[randomIndex];
                    } else {
                        const fallback = await getRandomAnime();
                        resultAnime = fallback.data;
                    }
                } else {
                    const res = await getRandomAnime();
                    resultAnime = res.data;
                }
            }
            
            setAnime(resultAnime);
        } catch (error) {
            console.error("Failed to fetch random anime", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box py={16} bg={bg}>
            <Container maxW="7xl">
                <Flex direction={{ base: 'column', md: 'row' }} gap={10} align="center">
                    <Box flex={1}>
                        <Heading mb={4} size="xl" fontFamily="body">Feeling Lucky?</Heading>
                        <Text fontSize="lg" mb={6} color={textColor}>
                            Discover your next favorite anime with a random pick from our massive database.
                        </Text>
                        
                        <HStack mb={6} spacing={4}>
                            <Box w="200px">
                                <FilterMenu 
                                    placeholder="All Genres" 
                                    value={selectedGenre}
                                    onChange={setSelectedGenre}
                                    options={genres.map(genre => ({
                                        value: genre.mal_id,
                                        label: genre.name
                                    }))}
                                />
                            </Box>
                            <Button 
                                leftIcon={<Shuffle />} 
                                colorScheme="pink" 
                                size="md" 
                                onClick={fetchRandom}
                                isLoading={loading}
                                loadingText="Rolling..."
                                px={8}
                            >
                                Surprise Me
                            </Button>
                        </HStack>
                    </Box>
                    
                    <Box flex={1} w="full">
                        {anime ? (
                            <MotionBox 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                bg={cardBg}
                                p={6}
                                borderRadius="2xl"
                                boxShadow="xl"
                            >
                                <Flex gap={6}>
                                    <Image 
                                        src={anime.images.jpg.large_image_url} 
                                        alt={anime.title} 
                                        w="140px" 
                                        h="200px" 
                                        objectFit="cover" 
                                        borderRadius="lg"
                                        fallbackSrc="https://placehold.co/140x200?text=No+Image"
                                    />
                                    <Box flex={1}>
                                        <Heading size="md" mb={2} noOfLines={2} fontFamily="body">{anime.title_english || anime.title}</Heading>
                                        <HStack mb={3}>
                                            <Badge colorScheme="pink">{anime.type}</Badge>
                                            <Badge colorScheme="yellow"><Star size={10} style={{display:'inline'}}/> {anime.score}</Badge>
                                            <Badge>{anime.year || 'Unknown'}</Badge>
                                        </HStack>
                                        <Text fontSize="sm" noOfLines={3} mb={4}>
                                            {anime.synopsis ? anime.synopsis.replace(/<[^>]*>?/gm, '') : ''}
                                        </Text>
                                        <Button as={Link} href={`/anime/${anime.mal_id}`} size="sm" variant="outline" colorScheme="pink">
                                            View Details
                                        </Button>
                                    </Box>
                                </Flex>
                            </MotionBox>
                        ) : (
                            <Box 
                                h="250px" 
                                border="2px dashed" 
                                borderColor="gray.300" 
                                borderRadius="2xl" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                                color="gray.400"
                            >
                                <Text>Select a genre (optional) and click &quot;Surprise Me&quot;!</Text>
                            </Box>
                        )}
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
};

const GENRE_IMAGES: Record<string, string> = {
  "Action": "/genres/action-jjk.jpg",
  "Adventure": "/genres/adventure-csm.jpg",
  "Comedy": "/genres/comedy-spyx.jpg", 
  "Drama": "/genres/drama.jpg",
  "Ecchi": "/genres/echhi.jpg",
  "Fantasy": "/genres/fantasy.jpg",
  "Horror": "/genres/horror.jpg",
  "Mahou Shoujo": "/genres/mahoushoujo.jpg",
  "Magical Girl": "/genres/mahoushoujo.jpg",
  "Mecha": "/genres/mecha.jpg",
  "Music": "/genres/music.jpg",
  "Mystery": "/genres/mystery.jpg",
  "Psychological": "/genres/psychological.jpg",
  "Romance": "/genres/romance.jpg",
  "Sci-Fi": "/genres/scifi.jpg",
  "Slice of Life": "/genres/sliceoflife.jpg",
  "Sports": "/genres/sports.jpg",
  "Supernatural": "/genres/supernatural.jpg",
  "Thriller": "/genres/thriller.jpg",
  "Suspense": "/genres/thriller.jpg"
};

export const BrowseByGenreSection = () => {
  const [genres, setGenres] = useState<{ mal_id: number; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchGenres = async () => {
          try {
              const res = await getAnimeGenres();
              // Sort by count and take top 18
              const sorted = res.data.sort((a, b) => b.count - a.count).slice(0, 18);
              setGenres(sorted);
          } catch (error) {
              console.error("Failed to fetch genres", error);
          } finally {
              setLoading(false);
          }
      };
      fetchGenres();
  }, []);

  const titleColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box py={10}>
      <Container maxW="7xl">
        <SectionHeader title="Browse by Genre" subtitle="Find exactly what you're looking for" href="/library" icon={<Filter size={24} />} />
        
        <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4}>
            {loading ? (
                Array(12).fill(0).map((_, i) => <Skeleton key={i} height="100px" borderRadius="xl" />)
            ) : (
                genres.map(genre => (
                    <Box
                        key={genre.mal_id} 
                        as={Link}
                        href={`/library?genre=${genre.mal_id}`}
                        position="relative"
                        borderRadius="xl"
                        overflow="hidden"
                        h="100px"
                        role="group"
                        cursor="pointer"
                        _hover={{
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 24px rgba(236, 72, 153, 0.3)"
                        }}
                        transition="all 0.3s ease"
                    >
                         {/* Background Image */}
                         <Image
                            src={GENRE_IMAGES[genre.name] || `https://placehold.co/300x150/222/000?text=${genre.name}`}
                            alt={genre.name}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            position="absolute"
                            inset={0}
                            transition="transform 0.5s ease"
                            _groupHover={{ transform: "scale(1.08)" }}
                         />
                         
                         {/* Ripple Overlay Effect */}
                         <Box 
                            position="absolute"
                            inset={0}
                            bg="blackAlpha.600"
                            transition="all 0.4s ease"
                            _groupHover={{ 
                                bg: "blackAlpha.400"
                            }}
                         />
                         
                         {/* Ripple Animation Keyframes - needs to be added via sx */}
                         <Box
                            position="absolute"
                            inset={0}
                            pointerEvents="none"
                            opacity={0}
                            _groupHover={{
                                opacity: 1,
                                animation: "ripple-wave 0.8s ease-out"
                            }}
                            sx={{
                                '@keyframes ripple-wave': {
                                    '0%': {
                                        boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4), 0 0 0 0 rgba(255, 255, 255, 0.3)',
                                    },
                                    '50%': {
                                        boxShadow: '0 0 0 20px rgba(255, 255, 255, 0.15), 0 0 0 40px rgba(255, 255, 255, 0.08)',
                                    },
                                    '100%': {
                                        boxShadow: '0 0 0 40px rgba(255, 255, 255, 0), 0 0 0 60px rgba(255, 255, 255, 0)',
                                    }
                                }
                            }}
                         />
                         
                         {/* Content */}
                         <Box 
                            position="absolute" 
                            inset={0} 
                            display="flex" 
                            flexDirection="column" 
                            alignItems="center" 
                            justifyContent="center"
                            textAlign="center"
                            p={2}
                            zIndex={2}
                         >
                            <Text 
                                color="white" 
                                fontWeight="black" 
                                fontSize="lg"
                                textShadow="0 2px 4px rgba(0,0,0,0.8)"
                                letterSpacing="wide"
                            >
                                {genre.name}
                            </Text>
                         </Box>
                    </Box>
                ))
            )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export const UpcomingSection = () => {
  const [upcoming, setUpcoming] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await getSeasonUpcoming();
        setUpcoming(res.data.slice(0, 10));
      } catch (error) {
        console.error('Error fetching upcoming anime:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);
  
  return (
    <Box py={10} bg={bg}>
      <Container maxW="7xl">
        <SectionHeader title="Upcoming Next Season" subtitle="Get ready for new adventures" href="/library?status=upcoming" icon={<Calendar size={24} />} />
      </Container>
      
      <Box 
        overflowX="auto" 
        pb={4} 
        w="100vw"
        ml="calc(50% - 50vw)"
        px={{ base: 4, md: 6, xl: 8 }}
        css={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(236, 72, 153, 0.55) transparent',
          '&::-webkit-scrollbar': {
            height: '5px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(236, 72, 153, 0.55)',
            borderRadius: '999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(236, 72, 153, 0.85)',
          },
        }}
      >
        <HStack spacing={{ base: 5, md: 6 }} minW="max-content">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Box key={i} minW="240px">
                <Skeleton height="320px" borderRadius="lg" mb={3} />
                <SkeletonText noOfLines={2} spacing="4" />
              </Box>
            ))
          ) : (
            upcoming.map(anime => (
              <AnimeCardHorizontal key={anime.mal_id} anime={anime} />
            ))
          )}
        </HStack>
      </Box>
    </Box>
  );
};
