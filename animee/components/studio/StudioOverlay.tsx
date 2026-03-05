'use client';

import { Box, Heading, Text, Button, VStack, Container, useColorModeValue, HStack, Icon, SimpleGrid, Badge, IconButton } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles, Heart, Star, Zap, Film, Book, TrendingUp, Award, Calendar, Play, Sword, Shield, Flame } from 'lucide-react';
import NextLink from 'next/link';

const Section = ({ children, align = 'center' }: { children: React.ReactNode, align?: 'left' | 'center' | 'right' }) => {
  return (
    <Box 
      h="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent={align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end'}
      p={{ base: 4, md: 10 }}
    >
      {children}
    </Box>
  );
};

export default function StudioOverlay() {
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const startAutoScroll = () => {
    setIsScrolling(true);
    // Find the scroll container - React Three Fiber's Scroll creates a div with overflow
    const scrollElement = document.querySelector('div[style*="overflow"]') as HTMLElement | null;
    if (!scrollElement) {
      console.log('Scroll element not found');
      return;
    }

    // Smooth auto-scroll to the bottom
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const duration = 40000; // 40 seconds for full scroll
    const startTime = Date.now();
    const startScroll = scrollElement.scrollTop;

    const animateScroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth scroll
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      scrollElement.scrollTop = startScroll + (scrollHeight * easeProgress);
      
      // Update current section based on scroll position
      const section = Math.floor((scrollElement.scrollTop / (scrollHeight || 1)) * 7);
      setCurrentSection(section);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
      }
    };

    animateScroll();
  };

  useEffect(() => {
    const scrollEl = document.querySelector('div[style*="overflow"]') as HTMLElement | null;
    if (!scrollEl) return;

    // Ensure pointer events are enabled for scrolling
    scrollEl.style.pointerEvents = 'auto';
    scrollEl.style.overflowY = 'auto';

    const handleScroll = () => {
      const scrollHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
      const section = Math.floor((scrollEl.scrollTop / (scrollHeight || 1)) * 7);
      setCurrentSection(section);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box w="full" minH="700vh" ref={scrollContainerRef}>
      {/* Section 1: Hero - Just Title and Arrow */}
      <Section>
        <VStack spacing={8} textAlign="center" maxW="5xl" w="full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <VStack spacing={6}>
              <Box position="relative" mb={4}>
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{ position: 'absolute', top: -40, right: -40, zIndex: 0 }}
                >
                  <Icon as={Star} boxSize={20} color="yellow.400" opacity={0.3} />
                </motion.div>
                <Heading 
                  fontSize={{ base: '5xl', md: '7xl', lg: '8xl' }} 
                  fontWeight="black"
                  lineHeight="1"
                  bgGradient="linear(to-r, pink.400, purple.500, cyan.400, pink.400)"
                  bgClip="text"
                  bgSize="200% 200%"
                  animation="gradient 3s ease infinite"
                  sx={{
                    '@keyframes gradient': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' }
                    }
                  }}
                >
                  Anirealm
                </Heading>
              </Box>
              <Text 
                fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} 
                fontWeight="bold"
                color={textColor}
                letterSpacing="wide"
                mt={2}
              >
                THE ULTIMATE ANIME EXPERIENCE
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={subTextColor} maxW="xl">
                Immerse yourself in a world where stories come alive
              </Text>
            </VStack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <VStack spacing={4} mt={6}>
              <IconButton
                aria-label="Start Journey"
                icon={<ArrowDown size={28} />}
                onClick={startAutoScroll}
                size="lg"
                rounded="full"
                colorScheme="pink"
                bgGradient="linear(to-r, pink.400, purple.500)"
                w={16}
                h={16}
                _hover={{ transform: 'scale(1.1)', shadow: '2xl' }}
                isDisabled={isScrolling}
                animation={!isScrolling ? 'bounce 2s infinite' : 'none'}
                sx={{
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                  }
                }}
              />
              <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                {isScrolling ? 'Enjoy the journey...' : 'Begin Your Journey'}
              </Text>
            </VStack>
          </motion.div>
        </VStack>
      </Section>

      {/* Section 2: The Big 3 - Legendary Anime */}
      <Section>
        <AnimatePresence>
          {currentSection >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 1 }}
            >
              <VStack spacing={10} maxW="6xl" w="full">
                <VStack spacing={4}>
                  <HStack spacing={4}>
                    <Icon as={Sword} boxSize={12} color="orange.400" />
                    <Heading size="2xl" bgGradient="linear(to-r, orange.400, red.500)" bgClip="text">
                      The Legendary Big 3
                    </Heading>
                    <Icon as={Shield} boxSize={12} color="red.400" />
                  </HStack>
                  <Text fontSize="xl" color={subTextColor} textAlign="center" maxW="2xl">
                    The anime that defined a generation and inspired millions worldwide
                  </Text>
                </VStack>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                  {/* One Piece Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="orange.400"
                      boxShadow="0 8px 24px rgba(251, 146, 60, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="orange.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="6xl" fontWeight="black" color="orange.400">海賊王</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="orange" fontSize="lg" px={3} py={1}>9.8</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="orange.400">One Piece</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          Follow Monkey D. Luffy's epic journey to become King of the Pirates. 
                          With over 1000 episodes, it's the greatest adventure story ever told.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="orange">1000+ Episodes</Badge>
                          <Badge colorScheme="yellow">Adventure</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="orange"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>

                  {/* Naruto Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="blue.400"
                      boxShadow="0 8px 24px rgba(96, 165, 250, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="blue.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="6xl" fontWeight="black" color="blue.400">忍者</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>9.7</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="blue.400">Naruto</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          The story of an outcast ninja who dreams of becoming Hokage. 
                          A tale of friendship, perseverance, and never giving up.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="blue">720 Episodes</Badge>
                          <Badge colorScheme="cyan">Ninja</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="blue"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>

                  {/* Bleach Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="purple.400"
                      boxShadow="0 8px 24px rgba(192, 132, 252, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="purple.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="6xl" fontWeight="black" color="purple.400">死神</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>9.6</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="purple.400">Bleach</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          Ichigo Kurosaki becomes a Soul Reaper to protect humanity from evil spirits. 
                          Epic battles and supernatural powers await.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="purple">366 Episodes</Badge>
                          <Badge colorScheme="pink">Supernatural</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="purple"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>
                </SimpleGrid>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Section 3: Modern Masterpieces */}
      <Section>
        <AnimatePresence>
          {currentSection >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, type: "spring" }}
            >
              <VStack spacing={10} maxW="6xl" w="full">
                <VStack spacing={4}>
                  <HStack spacing={4}>
                    <Icon as={Flame} boxSize={12} color="red.400" />
                    <Heading size="2xl" bgGradient="linear(to-r, red.400, pink.500)" bgClip="text">
                      Modern Masterpieces
                    </Heading>
                    <Icon as={Zap} boxSize={12} color="yellow.400" />
                  </HStack>
                  <Text fontSize="xl" color={subTextColor} textAlign="center" maxW="2xl">
                    The anime that are reshaping the industry with stunning animation and unforgettable stories
                  </Text>
                </VStack>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                  {/* Attack on Titan Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="red.400"
                      boxShadow="0 8px 24px rgba(248, 113, 113, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="red.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="5xl" fontWeight="black" color="red.400">進撃</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="red" fontSize="lg" px={3} py={1}>9.9</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="red.400">Attack on Titan</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          Humanity fights for survival against giant humanoid Titans. 
                          A dark, thrilling masterpiece with mind-blowing plot twists.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="red">87 Episodes</Badge>
                          <Badge colorScheme="orange">Dark Fantasy</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="red"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>

                  {/* Demon Slayer Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="green.400"
                      boxShadow="0 8px 24px rgba(74, 222, 128, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="green.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="5xl" fontWeight="black" color="green.400">鬼滅</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="green" fontSize="lg" px={3} py={1}>9.8</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="green.400">Demon Slayer</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          Tanjiro's quest to turn his demon sister back to human. 
                          Breathtaking animation and emotional storytelling.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="green">55 Episodes</Badge>
                          <Badge colorScheme="teal">Demons</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="green"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>

                  {/* Jujutsu Kaisen Card */}
                  <motion.div whileHover={{ scale: 1.05, y: -10 }} transition={{ duration: 0.3 }}>
                    <VStack
                      spacing={4}
                      bg={cardBg}
                      p={6}
                      borderRadius="2xl"
                      border="3px solid"
                      borderColor="pink.400"
                      boxShadow="0 8px 24px rgba(244, 114, 182, 0.4)"
                      backdropFilter="blur(20px)"
                      h="full"
                    >
                      <Box
                        w="full"
                        h="250px"
                        borderRadius="xl"
                        bg="pink.900"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                      >
                        <Text fontSize="5xl" fontWeight="black" color="pink.400">呪術</Text>
                        <Box position="absolute" bottom={2} right={2}>
                          <Badge colorScheme="pink" fontSize="lg" px={3} py={1}>9.7</Badge>
                        </Box>
                      </Box>
                      <VStack spacing={2} align="start" w="full">
                        <Heading size="lg" color="pink.400">Jujutsu Kaisen</Heading>
                        <Text color={subTextColor} fontSize="sm" noOfLines={3}>
                          A high school student fights cursed spirits with powerful sorcery. 
                          Fast-paced action and supernatural battles.
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme="pink">47 Episodes</Badge>
                          <Badge colorScheme="purple">Sorcery</Badge>
                        </HStack>
                      </VStack>
                      <Button
                        as={NextLink}
                        href="/library"
                        colorScheme="pink"
                        size="md"
                        w="full"
                        rounded="full"
                        rightIcon={<Icon as={Play} />}
                      >
                        Watch Now
                      </Button>
                    </VStack>
                  </motion.div>
                </SimpleGrid>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Section 4: Legendary Characters */}
      <Section align="left">
        <AnimatePresence>
          {currentSection >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 1, type: "spring" }}
            >
              <VStack 
                spacing={8} 
                maxW="xl" 
                bg={cardBg}
                p={{ base: 8, md: 12 }}
                borderRadius="3xl"
                backdropFilter="blur(30px)"
                border="3px solid"
                borderColor="blue.400"
                shadow="2xl"
                align="start"
              >
                <HStack spacing={4}>
                  <Icon as={Shield} boxSize={10} color="blue.400" />
                  <Heading size="2xl" bgGradient="linear(to-r, blue.400, cyan.400)" bgClip="text">
                    Legendary Heroes
                  </Heading>
                </HStack>
                <Text fontSize="xl" color={subTextColor} lineHeight="tall">
                  Follow the journeys of unforgettable characters. Heroes who inspire, 
                  villains who challenge, and stories that resonate across generations.
                </Text>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <Box p={4} bg="whiteAlpha.200" borderRadius="xl">
                    <Icon as={Flame} boxSize={6} color="orange.400" mb={2} />
                    <Text fontWeight="bold" color={textColor}>Action Heroes</Text>
                    <Text fontSize="sm" color={subTextColor}>Goku, Naruto, Luffy</Text>
                  </Box>
                  <Box p={4} bg="whiteAlpha.200" borderRadius="xl">
                    <Icon as={Heart} boxSize={6} color="pink.400" mb={2} />
                    <Text fontWeight="bold" color={textColor}>Romance Leads</Text>
                    <Text fontSize="sm" color={subTextColor}>Slice of Life Icons</Text>
                  </Box>
                  <Box p={4} bg="whiteAlpha.200" borderRadius="xl">
                    <Icon as={Zap} boxSize={6} color="yellow.400" mb={2} />
                    <Text fontWeight="bold" color={textColor}>Power Users</Text>
                    <Text fontSize="sm" color={subTextColor}>Supernatural Beings</Text>
                  </Box>
                  <Box p={4} bg="whiteAlpha.200" borderRadius="xl">
                    <Icon as={Star} boxSize={6} color="purple.400" mb={2} />
                    <Text fontWeight="bold" color={textColor}>Legends</Text>
                    <Text fontSize="sm" color={subTextColor}>All-Time Greats</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Section 5: Track Your Journey */}
      <Section align="right">
        <AnimatePresence>
          {currentSection >= 4 && (
            <motion.div
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 1 }}
            >
              <VStack 
                spacing={8} 
                maxW="xl" 
                bg={cardBg}
                p={{ base: 8, md: 12 }}
                borderRadius="3xl"
                backdropFilter="blur(30px)"
                border="3px solid"
                borderColor="green.400"
                shadow="2xl"
                align="end"
              >
                <HStack spacing={4}>
                  <Heading size="2xl" bgGradient="linear(to-r, green.400, teal.400)" bgClip="text" textAlign="right">
                    Track Everything
                  </Heading>
                  <Icon as={Calendar} boxSize={10} color="green.400" />
                </HStack>
                <Text fontSize="xl" color={subTextColor} textAlign="right" lineHeight="tall">
                  Never lose track of your progress. Journal your watching history, 
                  rate your favorites, and get notified about new episodes.
                </Text>
                <VStack align="end" spacing={3} w="full">
                  <HStack>
                    <Text color={subTextColor}>Personal Watchlist</Text>
                    <Icon as={Play} color="green.400" boxSize={5} />
                  </HStack>
                  <HStack>
                    <Text color={subTextColor}>Episode Tracker</Text>
                    <Icon as={TrendingUp} color="green.400" boxSize={5} />
                  </HStack>
                  <HStack>
                    <Text color={subTextColor}>Airing Schedule</Text>
                    <Icon as={Calendar} color="green.400" boxSize={5} />
                  </HStack>
                  <HStack>
                    <Text color={subTextColor}>Rate & Review</Text>
                    <Icon as={Star} color="green.400" boxSize={5} />
                  </HStack>
                </VStack>
                <HStack spacing={3} w="full">
                  <Button 
                    as={NextLink}
                    href="/journal"
                    flex={1}
                    colorScheme="green"
                    rounded="full"
                  >
                    My Journal
                  </Button>
                  <Button 
                    as={NextLink}
                    href="/schedule"
                    flex={1}
                    variant="outline"
                    colorScheme="green"
                    rounded="full"
                  >
                    Schedule
                  </Button>
                </HStack>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Section 6: Final CTA */}
      <Section>
        <AnimatePresence>
          {currentSection >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            >
              <VStack 
                spacing={10} 
                textAlign="center" 
                bg={cardBg}
                p={{ base: 10, md: 20 }}
                borderRadius="3xl"
                backdropFilter="blur(30px)"
                border="4px solid"
                borderColor="pink.400"
                shadow="2xl"
                maxW="5xl"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heading 
                    fontSize={{ base: '5xl', md: '7xl' }} 
                    bgGradient="linear(to-r, pink.400, purple.500, cyan.400)" 
                    bgClip="text"
                  >
                    Your Story Begins
                  </Heading>
                </motion.div>
                
                <Text fontSize={{ base: 'xl', md: '3xl' }} color={subTextColor} maxW="3xl">
                  Join millions of anime fans worldwide. Create your account and unlock 
                  the ultimate anime streaming experience.
                </Text>

                <HStack spacing={6} flexWrap="wrap" justify="center">
                  <Button 
                    as={NextLink}
                    href="/login"
                    size="lg" 
                    h={20}
                    px={12}
                    fontSize="2xl"
                    rounded="full"
                    colorScheme="pink"
                    bgGradient="linear(to-r, pink.400, purple.500)"
                    _hover={{ transform: 'scale(1.1)', shadow: '2xl' }}
                    rightIcon={<Icon as={Sparkles} />}
                  >
                    Join Free
                  </Button>
                  <Button 
                    as={NextLink}
                    href="/library"
                    size="lg" 
                    h={20}
                    px={12}
                    fontSize="2xl"
                    rounded="full"
                    variant="outline"
                    colorScheme="purple"
                    borderWidth="3px"
                    _hover={{ transform: 'scale(1.1)', bg: 'purple.50' }}
                    rightIcon={<Icon as={Film} />}
                  >
                    Browse Library
                  </Button>
                </HStack>

                <Text fontSize="sm" color={subTextColor}>
                  No credit card required • Instant access • Cancel anytime
                </Text>
              </VStack>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>
    </Box>
  );
}
