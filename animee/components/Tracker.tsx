'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, FormControl, FormLabel, Input, VStack, HStack, Badge, Heading, IconButton, useColorModeValue, SimpleGrid, Image, Text, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Spinner } from '@chakra-ui/react';
import { useJournal } from '@/context/JournalContext';
import { Trash2, Star, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterMenu } from './FilterMenu';
import AnimeSearchAutocomplete from './AnimeSearchAutocomplete';
import { JikanAnime, JikanManga } from '@/lib/anilist';
import { getLibrary, SuwayomiManga } from '@/lib/suwayomi';
import SuwayomiMangaCard from './SuwayomiMangaCard';

const MotionBox = motion(Box);
const MotionInput = motion(Input);

export default function Tracker() {
  const router = useRouter();
  const { entries, addEntry, removeEntry } = useJournal();

  const [type, setType] = useState<'anime' | 'manga'>('anime');
  const [selectedItem, setSelectedItem] = useState<JikanAnime | JikanManga | null>(null);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('Watching');
  const [rating, setRating] = useState('');
  
  const [suwayomiLibrary, setSuwayomiLibrary] = useState<SuwayomiManga[]>([]);
  const [suwayomiLoading, setSuwayomiLoading] = useState(false);

  // Fetch Suwayomi library when manga tab is active
  useEffect(() => {
    if (type === 'manga') {
      getLibrary()
        .then(setSuwayomiLibrary)
        .catch(err => console.error("Failed to fetch Suwayomi library:", err))
        .finally(() => setSuwayomiLoading(false));
    }
  }, [type]);

  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const dashedBorderColor = useColorModeValue('gray.300', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const inputColor = useColorModeValue('gray.800', 'white');

  const handleItemSelect = (item: JikanAnime | JikanManga) => {
    setSelectedItem(item);
  };

  const handleTypeChange = (val: string) => {
    const newType = val as 'anime' | 'manga';
    setType(newType);
    // Don't auto-set item or progress but allow status to default
    setStatus(newType === 'anime' ? 'Watching' : 'Reading');
    setSelectedItem(null);
  
    // Set loading immediately for better UX and to avoid useEffect setState warning
    if (newType === 'manga') {
      setSuwayomiLoading(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      return; // Don't submit if no item is selected
    }

    // Check if this exact item already exists in the entries
    const exists = entries.some(entry => {
      if (type === 'anime') {
        return entry.type === 'anime' && entry.animeId === selectedItem.mal_id;
      } else {
        return entry.type === 'manga' && entry.mangaId === selectedItem.mal_id;
      }
    });

    if (exists) {
      return; // Don't add if already exists
    }

    addEntry({
      type,
      animeId: type === 'anime' ? selectedItem.mal_id : undefined,
      mangaId: type === 'manga' ? selectedItem.mal_id : undefined,
      title: selectedItem.title,
      episode: type === 'anime' ? parseInt(progress) || 0 : undefined,
      chapter: type === 'manga' ? parseInt(progress) || 0 : undefined,
      status,
      rating: parseInt(rating) || 0,
      image: selectedItem.images.jpg.image_url,
    });
    
    // Reset form
    setSelectedItem(null);
    setProgress('');
    setRating('');
  };

  const animeEntries = entries.filter(e => e.type === 'anime');
  const mangaEntries = entries.filter(e => e.type === 'manga');

  return (
    <Box w="full">
      <MotionBox 
        bg={bg} 
        p={6} 
        borderRadius="lg" 
        mb={8} 
        border="1px" 
        borderColor={borderColor}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading size="md" color={headingColor} mb={4}>Add Entry</Heading>
        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <FormControl>
              <FormLabel color={labelColor}>Type</FormLabel>
              <FilterMenu 
                value={type} 
                onChange={handleTypeChange}
                placeholder="Type"
                options={[
                  { value: 'anime', label: 'Anime' },
                  { value: 'manga', label: 'Manga' }
                ]}
                showAllOption={false}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color={labelColor}>
                {type === 'anime' ? 'Search Anime' : 'Search Manga'}
              </FormLabel>
              <AnimeSearchAutocomplete
                type={type}
                placeholder={type === 'anime' ? "Search for an anime..." : "Search for a manga..."}
                onSelect={handleItemSelect}
                inputBg={inputBg}
                inputColor={inputColor}
              />
              {selectedItem && (
                <Badge mt={2} colorScheme="green" fontSize="sm">
                  ✓ Selected: {selectedItem.title}
                </Badge>
              )}
            </FormControl>
            <HStack gap={4}>
              <FormControl isRequired>
                <FormLabel color={labelColor}>{type === 'anime' ? 'Episode' : 'Chapter'}</FormLabel>
                <MotionInput 
                  type="number" 
                  value={progress} 
                  onChange={(e) => setProgress(e.target.value)} 
                  placeholder="1" 
                  color={inputColor} 
                  bg={inputBg} 
                  border="none"
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
                  transition={{ duration: 0.2 }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={labelColor}>Rating (1-10)</FormLabel>
                <MotionInput 
                  type="number" 
                  min="0" 
                  max="10" 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)} 
                  placeholder="0-10"
                  color={inputColor} 
                  bg={inputBg} 
                  border="none"
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
                  transition={{ duration: 0.2 }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={labelColor}>Status</FormLabel>
                <FilterMenu 
                  value={status} 
                  onChange={setStatus}
                  placeholder="Status"
                  options={type === 'anime' ? [
                    { value: "Watching", label: "Watching" },
                    { value: "Completed", label: "Completed" },
                    { value: "On Hold", label: "On Hold" },
                    { value: "Dropped", label: "Dropped" },
                    { value: "Plan to Watch", label: "Plan to Watch" }
                  ] : [
                    { value: "Reading", label: "Reading" },
                    { value: "Completed", label: "Completed" },
                    { value: "On Hold", label: "On Hold" },
                    { value: "Dropped", label: "Dropped" },
                    { value: "Plan to Read", label: "Plan to Read" }
                  ]}
                  showAllOption={false}
                />
              </FormControl>
            </HStack>
            <Button 
              type="submit" 
              colorScheme="pink" 
              mt={2}
              isDisabled={!selectedItem}
            >
              Add to Journal
            </Button>
          </VStack>
        </form>
      </MotionBox>

      <Tabs colorScheme="pink" variant="enclosed">
        <TabList>
          <Tab>Anime ({animeEntries.length})</Tab>
          <Tab>Manga ({mangaEntries.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            {animeEntries.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text color={labelColor}>No anime entries yet. Add one above!</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <AnimatePresence>
                  {animeEntries.map((entry) => (
                    <MotionBox
                      key={entry._id || entry.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        bg={bg}
                        borderRadius="xl"
                        overflow="hidden"
                        border="3px solid"
                        borderColor="pink.400"
                        position="relative"
                        boxShadow="0 4px 12px rgba(236, 72, 153, 0.3)"
                        _hover={{ 
                          transform: 'translateY(-4px)', 
                          boxShadow: '0 8px 24px rgba(236, 72, 153, 0.5)',
                          borderColor: 'pink.500'
                        }}
                        transition="all 0.3s"
                        cursor="pointer"
                        onClick={() => {
                          if (entry.animeId) {
                            router.push(`/anime/${entry.animeId}`);
                          }
                        }}
                      >
                        <Box position="relative" h="300px">
                          <Image
                            src={entry.image || 'https://via.placeholder.com/225x318'}
                            alt={entry.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                          <IconButton
                            aria-label="Delete"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeEntry(entry._id || entry.id);
                            }}
                          />
                        </Box>
                        <Box p={4}>
                          <Heading size="sm" color={headingColor} noOfLines={2} mb={2}>
                            {entry.title}
                          </Heading>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={labelColor}>Progress:</Text>
                              <Badge colorScheme="purple">Ep {entry.episode || 0}</Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={labelColor}>Status:</Text>
                              <Badge 
                                colorScheme={
                                  entry.status === 'Watching' ? 'green' : 
                                  entry.status === 'Completed' ? 'pink' : 
                                  entry.status === 'Dropped' ? 'red' : 'gray'
                                }
                              >
                                {entry.status}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={labelColor}>Rating:</Text>
                              <HStack spacing={1}>
                                <Star size={14} fill="#F6E05E" color="#F6E05E" />
                                <Text fontSize="sm" fontWeight="bold" color="yellow.400">
                                  {entry.rating}/10
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </Box>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </SimpleGrid>
            )}
          </TabPanel>

          <TabPanel px={0}>
            {/* Manga Tab Content */}
            <VStack spacing={8} align="stretch" w="full">
            
            {/* 1. Suwayomi Library Section (Primary for Manga) */}
            <Box>
              <HStack mb={4} justify="space-between">
                <Heading size="md" display="flex" alignItems="center" gap={2} color={headingColor}>
                   <Library size={20} /> Library
                </Heading>
                {suwayomiLoading && <Spinner size="sm" color="pink.500" />}
              </HStack>
              
              {suwayomiLoading ? (
                 <Flex justify="center" py={10}><Spinner size="xl" /></Flex>
              ) : suwayomiLibrary.length > 0 ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4}>
                  {suwayomiLibrary.map((manga) => (
                    <SuwayomiMangaCard key={manga.id} manga={manga} inLibrary={true} />
                  ))}
                </SimpleGrid>
              ) : (
                 <Box textAlign="center" py={8} borderWidth="1px" borderStyle="dashed" borderRadius="lg" borderColor={dashedBorderColor}>
                    <Text color="gray.500">No manga found in your library.</Text>
                 </Box>
              )}
            </Box>

            <Divider />

            {/* 2. Manual Journal Entries Section */}
            {mangaEntries.length > 0 && (
              <Box>
                <Heading size="md" mb={4} color={headingColor}>Manual Entries</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  <AnimatePresence>
                    {mangaEntries.map((entry) => (
                      <MotionBox
                        key={entry._id || entry.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          bg={bg}
                          borderRadius="xl"
                          overflow="hidden"
                          border="3px solid"
                          borderColor="pink.400"
                          position="relative"
                          boxShadow="0 4px 12px rgba(236, 72, 153, 0.3)"
                          _hover={{ 
                            transform: 'translateY(-4px)', 
                            boxShadow: '0 8px 24px rgba(236, 72, 153, 0.5)',
                            borderColor: 'pink.500'
                          }}
                          transition="all 0.3s"
                          cursor="pointer"
                          onClick={() => {
                            if (entry.mangaId) {
                              router.push(`/manga/${entry.mangaId}`);
                            }
                          }}
                        >
                          <Box position="relative" h="300px">
                            <Image
                              src={entry.image || 'https://via.placeholder.com/225x318'}
                              alt={entry.title}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                            <IconButton
                              aria-label="Delete"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  removeEntry(entry._id || entry.id);
                              }}
                            />
                          </Box>
                          <Box p={4}>
                            <Heading size="sm" color={headingColor} noOfLines={2} mb={2}>
                              {entry.title}
                            </Heading>
                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={labelColor}>Progress:</Text>
                                <Badge colorScheme="orange">Ch {entry.chapter || 0}</Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={labelColor}>Status:</Text>
                                <Badge 
                                  colorScheme={
                                    entry.status === 'Reading' ? 'green' : 
                                    entry.status === 'Completed' ? 'pink' : 
                                    entry.status === 'Dropped' ? 'red' : 'gray'
                                  }
                                >
                                  {entry.status}
                                </Badge>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={labelColor}>Rating:</Text>
                                <HStack spacing={1}>
                                  <Star size={14} fill="#F6E05E" color="#F6E05E" />
                                  <Text fontSize="sm" fontWeight="bold" color="yellow.400">
                                    {entry.rating}/10
                                  </Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>
                        </Box>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
              </Box>
            )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
