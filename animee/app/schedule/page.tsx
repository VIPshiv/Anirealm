'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Badge, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Flex, Spinner, Center, Button } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSchedules, JikanAnime } from '@/lib/anilist';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Schedule() {
  const [schedule, setSchedule] = useState<Record<string, JikanAnime[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [userTimezone, setUserTimezone] = useState<string | null>(null);

  const bg = useColorModeValue('gray.50', 'black');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeTabBg = useColorModeValue('pink.500', 'pink.500');
  const activeTabColor = useColorModeValue('white', 'white');

  useEffect(() => {
    // Set initial tab based on current day and timezone
    const today = new Date().getDay(); // 0 is Sunday
    const index = today === 0 ? 6 : today - 1;
    setTabIndex(index);
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Fetch initial data for the current day
    const fetchInitialSchedule = async () => {
      const currentDay = DAYS[index];
      setLoading(true);
      setError(null);
      try {
        const res = await getSchedules(currentDay);
        setSchedule(prev => ({ ...prev, [currentDay]: res.data }));
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load schedule. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialSchedule();
  }, []);

  const handleTabChange = async (index: number) => {
    setTabIndex(index);
    const day = DAYS[index];
    if (!schedule[day]) {
      setLoading(true);
      setError(null);
      try {
        const res = await getSchedules(day);
        setSchedule(prev => ({ ...prev, [day]: res.data }));
      } catch (error) {
        console.error(`Error fetching schedule for ${day}:`, error);
        setError('Failed to load schedule. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Container maxW="7xl" py={24}>
        <VStack spacing={2} align="start" mb={8}>
          <Heading color={textColor}>Anime Schedule</Heading>
          <Text color={subTextColor}>
            Weekly airing schedule. Times are automatically converted to your local timezone ({userTimezone || 'Loading...'}).
          </Text>
        </VStack>

        <Tabs variant="soft-rounded" colorScheme="pink" index={tabIndex} isLazy onChange={handleTabChange}>
          <TabList overflowX="auto" py={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
            {DAYS.map((day) => (
              <Tab 
                key={day} 
                flexShrink={0} 
                mr={2}
                _selected={{ bg: activeTabBg, color: activeTabColor }}
                color={subTextColor}
                textTransform="capitalize"
              >
                {day}
              </Tab>
            ))}
          </TabList>

          <TabPanels mt={6}>
            {DAYS.map((day) => (
              <TabPanel key={day} p={0}>
                {loading && !schedule[day] ? (
                  <Center py={20}>
                    <Spinner size="xl" color="pink.500" />
                  </Center>
                ) : error ? (
                   <Center py={20} flexDirection="column">
                     <Text color="red.400" mb={4}>{error}</Text>
                     <Button 
                       onClick={() => handleTabChange(DAYS.indexOf(day))}
                       colorScheme="pink"
                       size="sm"
                     >
                       Retry
                     </Button>
                   </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {schedule[day]?.map((anime) => (
                      <Link key={anime.mal_id} href={`/anime/${anime.mal_id}`}>
                        <HStack 
                          bg={cardBg} 
                          p={4} 
                          borderRadius="xl" 
                          borderWidth="1px" 
                          borderColor={borderColor}
                          spacing={4}
                          align="start"
                          transition="transform 0.2s"
                          _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
                        >
                          <Image 
                            src={anime.images.jpg.image_url} 
                            alt={anime.title} 
                            w="80px" 
                            h="110px" 
                            objectFit="cover" 
                            borderRadius="md" 
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="medium" fontSize="sm" color="pink.400">
                                {anime.broadcast?.time || 'Unknown'}
                              </Text>
                              <Badge colorScheme={anime.airing ? 'green' : 'gray'} fontSize="xs">
                                {anime.status}
                              </Badge>
                            </HStack>
                            <Heading size="sm" fontWeight="semibold" color={textColor} noOfLines={2}>
                              {anime.title_english || anime.title}
                            </Heading>
                            <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                              {anime.episodes ? `${anime.episodes} eps` : 'Unknown eps'}
                            </Text>
                            <HStack mt="auto" pt={2}>
                              <Clock size={14} color="gray" />
                              <Text fontSize="xs" color="gray.500">
                                {anime.broadcast?.timezone || 'JST'}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      </Link>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Container>
      <Footer />
    </Box>
  );
}