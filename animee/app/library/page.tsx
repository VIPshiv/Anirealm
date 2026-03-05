'use client';

import { Box, Container, SimpleGrid, Heading, Text, Flex, Input, InputGroup, InputLeftElement, Select, HStack, IconButton, Stack, VStack, Button, useColorModeValue, Spinner, Center, Grid, GridItem, Image, Badge, LinkBox, LinkOverlay } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchAnime, getAnimeGenres, JikanAnime } from '@/lib/anilist';
import { useState, useEffect, Suspense } from 'react';
import { LayoutGrid, List as ListIcon, Search, ChevronLeft, ChevronRight, Plus, Check, Star } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { BlurReveal } from '@/components/TextAnimations';
import NextLink from 'next/link';
import { useJournal } from '@/context/JournalContext';
import { FilterMenu } from '@/components/FilterMenu';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);
const MotionSelect = motion(Select);
const MotionGrid = motion(Grid);
const MotionGridItem = motion(GridItem);

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
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const getGridSpans = (index: number, total: number) => {
  // Normal Grid: All items are uniform 1x1 blocks.
  return { col: 1, row: 1 };
};

// Bento Card Component
const BentoCard = ({ anime, index, total }: { anime: JikanAnime; index: number; total: number }) => {
  const { addEntry, getEntry } = useJournal();
  const isAdded = !!getEntry(anime.mal_id, 'anime');
  
  const spans = getGridSpans(index, total);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
  };

  return (
    <MotionGridItem
      variants={itemVariants}
      colSpan={{ base: 1, md: spans.col }}
      rowSpan={{ base: 1, md: spans.row }}
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      role="group"
      cursor="pointer"
      bg="black"
      border="1px solid"
      borderColor="whiteAlpha.100"
      h="100%"
      minH={{ base: "200px", md: "100%" }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      _hover={{ borderColor: "whiteAlpha.300" }}
    >
      <LinkBox h="100%">
        {/* Sheen Effect */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, transparent 50%)"
          transform="translateX(-100%)"
          transition="transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          _groupHover={{ transform: "translateX(100%)" }}
          pointerEvents="none"
          zIndex={2}
        />

        {/* Image */}
        <Image
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
          alt={anime.title}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)"
          _groupHover={{ transform: 'scale(1.05)' }}
        />

        {/* Dark Gradient Overlay - Always visible for text readability */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.900 0%, blackAlpha.500 40%, transparent 100%)"
          opacity={0.8}
          transition="opacity 0.3s"
          _groupHover={{ opacity: 0.9 }}
        />

        {/* Content Container */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={5}
          direction="column"
          justify="end"
          h="100%"
          align="flex-start"
        >
           {/* Top Right Badges (Absolute) */}
           <HStack position="absolute" top={4} right={4} spacing={2}>
              <Badge 
                bg="blackAlpha.600" 
                color="white" 
                backdropFilter="blur(10px)" 
                borderRadius="md" 
                px={2} 
                py={1}
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {anime.type}
              </Badge>
              {anime.score && (
                <Badge 
                  bg="pink.500" 
                  color="white" 
                  borderRadius="md" 
                  px={2} 
                  py={1}
                  fontSize="xs"
                  display="flex" 
                  alignItems="center"
                  gap={1}
                >
                  <Star size={10} fill="currentColor" /> {anime.score}
                </Badge>
              )}
           </HStack>

          {/* Title & Info - Slides up slightly */}
          <VStack 
            align="start" 
            spacing={1} 
            w="full"
            transform="translateY(10px)"
            transition="transform 0.3s ease"
            _groupHover={{ transform: 'translateY(0)' }}
          >
            <Heading 
              size={spans.col > 1 ? "lg" : "md"} 
              color="white" 
              noOfLines={2} 
              lineHeight="1.2"
              letterSpacing="tight"
            >
              <LinkOverlay as={NextLink} href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
                {anime.title_english || anime.title}
              </LinkOverlay>
            </Heading>
            
            <Text fontSize="xs" color="gray.300" fontWeight="medium" letterSpacing="wide">
              {anime.year || 'Unknown'} • {anime.episodes || '?'} EPISODES
            </Text>

            {/* Description & Action - Only visible on hover */}
            <Box 
              h={0} 
              overflow="hidden" 
              opacity={0}
              transition="all 0.3s ease"
              _groupHover={{ h: 'auto', opacity: 1, marginTop: '12px' }}
              w="full"
            >
              <Text color="gray.400" fontSize="sm" noOfLines={2} mb={3} lineHeight="tall">
                {anime.synopsis ? anime.synopsis.replace(/<[^>]*>?/gm, '') : ''}
              </Text>
              
              <Button
                size="sm"
                w="full"
                bg={isAdded ? "green.500" : "white"}
                color={isAdded ? "white" : "black"}
                _hover={{ bg: isAdded ? "green.600" : "gray.200" }}
                leftIcon={isAdded ? <Check size={14} /> : <Plus size={14} />}
                onClick={handleAdd}
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wide"
                h="32px"
              >
                {isAdded ? "In Library" : "Add to Library"}
              </Button>
            </Box>
          </VStack>
        </Flex>
      </LinkBox>
    </MotionGridItem>
  );
};

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('genre') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedQuery] = useDebounce(searchQuery, 500);
  const [animeList, setAnimeList] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState('popularity');
  
  // Data
  const [genres, setGenres] = useState<{ mal_id: number; name: string }[]>([]);

  const bg = useColorModeValue('gray.50', 'black');
  const filterBg = useColorModeValue('white', 'gray.900');
  const filterBorder = useColorModeValue('gray.200', 'whiteAlpha.100');
  const inputBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');
  const selectColor = useColorModeValue('gray.800', 'white');

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getAnimeGenres('genres');
        setGenres(res.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Sync search query from URL
  useEffect(() => {
    if (initialSearch !== null) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedType, selectedStatus, selectedRating, selectedGenre, sortBy]);


  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const params: any = {
          limit: 36,
          page: page,
          sort: 'desc',
          sfw: true
        };

        const trimmedQuery = debouncedQuery?.trim();
        if (trimmedQuery) {
          params.q = trimmedQuery;
        }

        if (!trimmedQuery || sortBy !== 'popularity') {
            params.order_by = sortBy;
        }

        if (selectedType) params.type = selectedType;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedRating) params.rating = selectedRating;
        if (selectedGenre) params.genres = selectedGenre;

        const res = await searchAnime(params);
        
        // Deduplicate before setting state
        // Especially important if something causes a double fetch or API strangeness
        const uniqueData = Array.from(new Map(res.data.map(item => [item.mal_id, item])).values());
        
        setAnimeList(uniqueData);
        setHasNextPage(res.pagination.has_next_page);
      } catch (error) {
        console.error('Error fetching anime:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [debouncedQuery, selectedType, selectedStatus, selectedRating, selectedGenre, sortBy, page]);

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="8xl" py={24}>
        <Flex justify="space-between" align="end" mb={8} wrap="wrap" gap={4}>
          <Box>
            <BlurReveal color={textColor} mb={2}>Library</BlurReveal>
            <Text color={subTextColor}>Explore our vast collection of anime titles.</Text>
          </Box>
        </Flex>

        {/* Filters & Controls */}
        <Stack spacing={4} mb={8} bg={filterBg} p={6} borderRadius="2xl" border="1px solid" borderColor={filterBorder}>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents='none'>
                <Search size={20} color='gray' />
              </InputLeftElement>
              <Input 
                placeholder="Search anime..." 
                bg={inputBg} 
                border="none" 
                color={textColor}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                _focus={{ ring: 2, ringColor: 'pink.400' }}
              />
            </InputGroup>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <FilterMenu 
              placeholder="Genre"
              value={selectedGenre}
              onChange={setSelectedGenre}
              options={genres.map(g => ({ value: g.mal_id, label: g.name }))}
            />
            <FilterMenu 
              placeholder="Type"
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: 'tv', label: 'TV' },
                { value: 'movie', label: 'Movie' },
                { value: 'ova', label: 'OVA' },
                { value: 'special', label: 'Special' },
              ]}
            />
            <FilterMenu 
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'airing', label: 'Airing' },
                { value: 'complete', label: 'Complete' },
                { value: 'upcoming', label: 'Upcoming' },
              ]}
            />
            <FilterMenu 
              placeholder="Rating"
              value={selectedRating}
              onChange={setSelectedRating}
              options={[
                { value: 'g', label: 'G - All Ages' },
                { value: 'pg', label: 'PG - Children' },
                { value: 'pg13', label: 'PG-13 - Teens+' },
                { value: 'r17', label: 'R - 17+' },
              ]}
            />
            <FilterMenu 
              placeholder="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'popularity', label: 'Popularity' },
                { value: 'score', label: 'Score' },
                { value: 'start_date', label: 'Newest' },
                { value: 'title', label: 'Title' },
              ]}
            />
          </SimpleGrid>
        </Stack>

        {/* Bento Grid Content */}
        {loading ? (
          <Center py={20}>
            <Spinner size="xl" color="pink.400" thickness="4px" />
          </Center>
        ) : (
          <AnimatePresence mode="wait">
            <MotionGrid
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              templateColumns={{
                base: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
                xl: "repeat(6, 1fr)"
              }}
              gap={{ base: 3, md: 4 }}
              autoFlow="dense"
              autoRows={{ base: 'minmax(180px, auto)', md: 'minmax(200px, auto)' }}
            >
              {animeList.map((anime, index) => (
                <BentoCard key={anime.mal_id} anime={anime} index={index} total={animeList.length} />
              ))}
            </MotionGrid>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && animeList.length > 0 && (
          <Flex justify="center" pt={12} gap={4}>
            <Button
              leftIcon={<ChevronLeft />}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              isDisabled={page === 1}
              variant="ghost"
              colorScheme="pink"
              size="lg"
            >
              Previous
            </Button>
            <Flex align="center" px={6} bg={filterBg} borderRadius="full" border="1px solid" borderColor={filterBorder}>
              <Text fontWeight="bold">Page {page}</Text>
            </Flex>
            <Button
              rightIcon={<ChevronRight />}
              onClick={() => setPage(p => p + 1)}
              isDisabled={!hasNextPage}
              variant="ghost"
              colorScheme="pink"
              size="lg"
            >
              Next
            </Button>
          </Flex>
        )}
      </Container>
      <Footer />
    </Box>
  );
}

export default function Library() {
  return (
    <Suspense fallback={<Center minH="100vh"><Spinner size="xl" color="pink.500" /></Center>}>
      <LibraryContent />
    </Suspense>
  );
}
