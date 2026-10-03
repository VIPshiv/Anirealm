'use client';

import { Box, Container, Grid, GridItem, Heading, Text, Image, Badge, Stack, Flex, Button, useColorModeValue, Spinner, Center, VStack, LinkBox, LinkOverlay, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, SimpleGrid, useToast } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SuwayomiMangaCard from '@/components/SuwayomiMangaCard';
import { getMangaDetails, getChapters, SuwayomiManga, SuwayomiChapter, getMangaIconUrl, addMangaToLibrary, getSources, SuwayomiSource } from '@/lib/suwayomi';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Star, Plus, PlayCircle, Check, ArrowRightLeft } from 'lucide-react';
import { useJournal } from '@/context/JournalContext';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';

export default function MangaDetails() {
  const params = useParams();
  const id = Number(params.id);
  const [manga, setManga] = useState<SuwayomiManga | null>(null);
  const [chapters, setChapters] = useState<SuwayomiChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const { addEntry, getEntry } = useJournal();
  
  const isJournalAdded = !!getEntry(id, 'manga');
  const isSuwayomiAdded = manga?.isFavorite || false;
  const isAdded = isJournalAdded || isSuwayomiAdded;

  const bg = useColorModeValue('gray.50', 'black');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const gradient = useColorModeValue(
    'linear(to-t, gray.50, transparent)',
    'linear(to-t, gray.900, transparent)'
  );
  const imageBorderColor = useColorModeValue('white', 'gray.800');

  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<SuwayomiManga[]>([]);
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);

  useEffect(() => {
    const savedPins = localStorage.getItem('pinnedSources');
    if (savedPins) {
      try {
        setPinnedSources(JSON.parse(savedPins));
      } catch (e) {
        console.error('Failed to parse pinned sources', e);
      }
    }
  }, []);

  const handleMigrateSearch = async () => {
    if (!manga) return;
    setIsMigrating(true);
    onOpen();
    setMigrationResults([]);

    try {
      let sourcesToSearch = pinnedSources;
      if (sourcesToSearch.length === 0) {
          const allSources = await getSources();
          sourcesToSearch = allSources.slice(0, 10).map(s => s.id);
          toast({
              title: "No pinned sources",
              description: "Searching in top 10 available sources instead.",
              status: "info",
              duration: 3000,
          });
      }

      const sourceIds = sourcesToSearch.join(',');
      const response = await fetch(`/api/search?q=${encodeURIComponent(manga.title)}&sources=${encodeURIComponent(sourceIds)}`);
      
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const allResults: (SuwayomiManga & { sourceId: string })[] = data.results || [];
      
      const filtered = allResults.filter(r => r.url !== manga.url);
      const uniqueResults = Array.from(new Map(filtered.map(m => [m.url, m])).values());
      setMigrationResults(uniqueResults);

    } catch (e) {
      toast({ title: "Migration search failed", status: "error" });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSelectMigration = async (targetManga: SuwayomiManga) => {
      try {
          const newId = await addMangaToLibrary(targetManga.sourceId, targetManga.url, targetManga.title);
          toast({ title: "Migrated successfully", status: "success" });
          onClose();
          router.push(`/manga/${newId}`);
      } catch (e) {
          toast({ title: "Migration failed", description: String(e), status: "error" });
      }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [mangaRes, chaptersRes] = await Promise.all([
          getMangaDetails(id),
          getChapters(id).catch(e => {
            console.error("Failed to fetch chapters:", e);
            return [];
          })
        ]);
        setManga(mangaRes);
        // Sort chapters by number descending (newest first)
        setChapters(chaptersRes.sort((a, b) => b.chapterNumber - a.chapterNumber));
      } catch (error) {
        console.error('Error fetching manga details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Center h="50vh">
          <Spinner size="xl" color="pink.500" />
        </Center>
        <Footer />
      </Box>
    );
  }

  if (!manga) {
    return (
      <Box bg={bg} minH="100vh">
        <Navbar />
        <Container maxW="7xl" py={32} textAlign="center">
          <Heading color={textColor}>Manga not found</Heading>
        </Container>
        <Footer />
      </Box>
    );
  }

  const iconUrl = getMangaIconUrl(manga.id);

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      
      {/* Hero / Banner Section */}
      <Box 
        h="50vh" 
        position="relative" 
        overflow="hidden"
      >
        <Image 
          src={iconUrl} 
          alt={manga.title} 
          w="full" 
          h="full" 
          objectFit="cover" 
          filter="blur(20px) brightness(0.4)"
          transform="scale(1.1)"
        />
        <Box position="absolute" bottom={0} left={0} right={0} h="full" bgGradient={gradient} />
      </Box>

      <Container maxW="7xl" mt="-300px" position="relative" zIndex={1} pb={20}>
        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={10}>
          {/* Left Column: Poster & Actions */}
          <GridItem>
            <Image 
              src={iconUrl} 
              alt={manga.title} 
              borderRadius="xl" 
              boxShadow="2xl" 
              w="full" 
              border="4px solid" 
              borderColor={imageBorderColor}
            />
            <Stack mt={6} spacing={3}>
              <Button 
                colorScheme={isAdded ? "green" : "pink"} 
                size="lg" 
                leftIcon={isAdded ? <Check size={20} /> : <Plus size={20} />}
                w="full"
                onClick={async () => {
                  if (isAdded) return;
                  
                  // Add to Journal
                  addEntry({
                    type: 'manga',
                    mangaId: id,
                    title: manga.title,
                    chapter: 0,
                    status: 'Plan to Read',
                    rating: 0,
                    image: iconUrl
                  });

                  // Add to Suwayomi Library
                  if (manga.sourceId && manga.url) {
                      try {
                          await addMangaToLibrary(manga.sourceId, manga.url, manga.title);
                          setManga(prev => prev ? ({ ...prev, isFavorite: true }) : null);
                      } catch (e) {
                          console.error("Failed to add to Suwayomi library", e);
                      }
                  }
                }}
                isDisabled={isAdded}
              >
                {isAdded ? "Added to Library" : "Add to Library"}
              </Button>
              <Button 
                variant="outline" 
                colorScheme="purple" 
                size="lg" 
                leftIcon={<ArrowRightLeft size={20} />}
                w="full"
                onClick={handleMigrateSearch}
              >
                Migrate Source
              </Button>
              <Flex justify="center" gap={4} color={subTextColor} fontSize="sm">
                <Flex align="center" gap={1}>
                  <Star size={16} fill="currentColor" color="pink" />
                  <Text fontWeight="bold" color={textColor}>N/A</Text>
                </Flex>
                <Flex align="center" gap={1}>
                  <BookOpen size={16} />
                  <Text>{manga.status || 'Unknown Status'}</Text>
                </Flex>
              </Flex>
            </Stack>
          </GridItem>

          {/* Right Column: Details */}
          <GridItem pt={{ base: 0, md: 20 }}>
            <Stack spacing={6}>
              <Box>
                <Heading size="2xl" mb={2} color={textColor}>{manga.title}</Heading>
                <Text fontSize="xl" color={subTextColor}>{manga.author}</Text>
              </Box>

              <Flex gap={2} wrap="wrap">
                {manga.genre?.map((genre, index) => (
                  <Badge key={index} colorScheme="pink" fontSize="md" px={3} py={1} borderRadius="full">
                    {genre}
                  </Badge>
                ))}
              </Flex>

              <Box>
                <Heading size="md" mb={3} color={textColor}>Synopsis</Heading>
                <Text color={subTextColor} lineHeight="tall" fontSize="lg">
                  {manga.description || 'No description available.'}
                </Text>
              </Box>

              <Box>
                <Heading size="md" mb={3} color={textColor}>Information</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                  <GridItem>
                    <Text color={subTextColor} fontSize="sm">Artist</Text>
                    <Text fontWeight="medium" color={textColor}>
                      {manga.artist || 'Unknown'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text color={subTextColor} fontSize="sm">Source</Text>
                    <Text fontWeight="medium" color={textColor}>{manga.sourceId || 'Local'}</Text>
                  </GridItem>
                  <GridItem>
                    <Text color={subTextColor} fontSize="sm">Status</Text>
                    <Text fontWeight="medium" color={textColor}>
                      {manga.status || 'Unknown'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text color={subTextColor} fontSize="sm">URL</Text>
                    <Text fontWeight="medium" color={textColor} noOfLines={1}>{manga.url || 'N/A'}</Text>
                  </GridItem>
                </Grid>
              </Box>

              {/* Chapters Section */}
              <Box>
                <Heading size="md" mb={4} color={textColor}>Chapters ({chapters.length})</Heading>
                <VStack spacing={2} align="stretch" maxH="500px" overflowY="auto" pr={2} data-lenis-prevent css={{
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'pink', borderRadius: '4px' },
                }}>
                  {chapters.map((chapter) => (
                    <LinkBox key={chapter.id} as={Box} p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor} _hover={{ borderColor: 'pink.400', transform: 'translateX(4px)' }} transition="all 0.2s">
                      <Flex justify="space-between" align="center">
                        <Box>
                          <LinkOverlay as={NextLink} href={`/manga/${manga.id}/watch/${chapter.id}`}>
                            <Text fontWeight="bold" color={textColor}>
                              {chapter.name || `Chapter ${chapter.chapterNumber}`}
                            </Text>
                          </LinkOverlay>
                          <Text fontSize="sm" color={subTextColor}>
                            {new Date(chapter.uploadDate).toLocaleDateString()}
                          </Text>
                        </Box>
                        <PlayCircle size={20} color="pink" />
                      </Flex>
                    </LinkBox>
                  ))}
                </VStack>
              </Box>
            </Stack>
          </GridItem>
        </Grid>
      </Container>

      {/* Migration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>Migrate "{manga.title}"</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} color={subTextColor}>
              Select a source to migrate this manga to. This will add the new version to your library.
            </Text>
            
            {isMigrating ? (
              <Center py={10}><Spinner /></Center>
            ) : migrationResults.length > 0 ? (
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                {migrationResults.map(res => (
                  <Box 
                    key={res.url} 
                    cursor="pointer" 
                    onClick={() => handleSelectMigration(res)}
                    _hover={{ transform: 'scale(1.02)' }}
                    transition="transform 0.2s"
                  >
                    <SuwayomiMangaCard manga={res} />
                    <Badge colorScheme="purple" mt={2} fontSize="xs" noOfLines={1}>{res.sourceId}</Badge>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={10} flexDirection="column">
                <Text>No alternatives found.</Text>
                <Text fontSize="sm" color="gray.500">Try pinning more sources in the dashboard.</Text>
              </Center>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Footer />
    </Box>
  );
}
