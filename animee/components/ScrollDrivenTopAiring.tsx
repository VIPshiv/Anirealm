'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Flex, Image, useColorModeValue, Container, VStack, HStack, Button } from '@chakra-ui/react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { JikanAnime, getTopAnime } from '@/lib/anilist';
import { Star, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';


const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);
const MotionHeading = motion.create(Heading);

export default function ScrollDrivenTopAiring() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animeList, setAnimeList] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTopAnime({ filter: 'airing', limit: 5 }); // Get top 5
      setAnimeList(res.data);
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to load top airing anime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
    layoutEffect: false
  });

  // We'll use 4 slides for the demo as requested (01, 02, 03, 04)
  const slides = animeList.slice(0, 4);
  const totalSlides = Math.max(1, slides.length);

  // Normalize progress so slides finish before the sticky section releases
  // Also hold at 0 briefly so slide 1 doesn't transition before the sticky takes over
  const releaseAt = totalSlides / (totalSlides + 1);
  const smoothProgress = useTransform(
    scrollYProgress,
    [0, 0.08, releaseAt, 1],
    [0, 0, 1, 1],
    { clamp: true }
  );

  if (error) {
    return (
      <Box h="50vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bg="black" color="white" gap={4}>
        <AlertTriangle size={48} color="#F687B3" />
        <Text fontSize="xl" fontWeight="bold">Unable to load content</Text>
        <Text color="gray.400">{error}</Text>
        <Button 
          onClick={fetchData} 
          colorScheme="pink" 
          leftIcon={<RefreshCw size={16} />}
          size="sm"
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (loading || animeList.length === 0) return null;

  return (
    <Box ref={containerRef} h={`${(totalSlides + 1) * 100}vh`} position="relative" bg="black">
      <Box position="sticky" top={0} h="100vh" overflow="hidden">
        {slides.map((anime, index) => (
          <Slide 
            key={anime.mal_id} 
            anime={anime} 
            index={index} 
            total={totalSlides} 
            progress={smoothProgress} 
          />
        ))}
        
        {/* Global Navigation (Sticky) */}
        <Navigation total={totalSlides} progress={smoothProgress} containerRef={containerRef} />
      </Box>
    </Box>
  );
}

function Slide({ anime, index, total, progress }: { anime: JikanAnime, index: number, total: number, progress: MotionValue<number> }) {
  const step = 1 / total;
  const start = index * step;
  const end = (index + 1) * step;
  const isFirst = index === 0;

  // Stacking Transition:
  // Slides simply fade in on top of previous ones. No fade out (prevents white flashes).
  // We use a gentle overlap for smoothness.
  const fadeInEnd = start + (step * 0.35); 

  const activeOpacity = useTransform(
    progress,
    isFirst ? [0, 1] : [start, fadeInEnd],
    isFirst ? [1, 1] : [0, 1]
  );

  const scale = useTransform(
    progress,
    [start, end],
    [1.05, 1.0]
  );

  // Text Entrance - Minimalist (No exit animation, just gets covered)
  const textY = useTransform(
    progress,
    isFirst ? [0, 1] : [start, fadeInEnd],
    isFirst ? [0, 0] : [20, 0]
  );
  
  const textOpacity = useTransform(
    progress,
    isFirst ? [0, 1] : [start, fadeInEnd],
    isFirst ? [1, 1] : [0, 1]
  );

  return (
    <MotionBox
      position="absolute"
      inset={0}
      style={{ opacity: activeOpacity, zIndex: index }}
      bg="black"
      overflow="hidden"
    >
      {/* Background Image with Parallax Scale */}
      <MotionBox 
        position="absolute" 
        inset={0}
        style={{ scale }}
      >
        <Image
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          objectFit="cover"
          w="100%"
          h="100%"
          opacity={0.7}
        />
        {/* Cinematic Gradient Overlay Removed as per request */}
      </MotionBox>

      {/* Content */}
      <Container maxW="7xl" h="100%" position="relative">
        <Flex 
          h="100%" 
          direction="column" 
          justify="center" 
          maxW="3xl"
          color="white"
          px={{ base: 4, md: 0 }}
        >
          <MotionBox style={{ y: textY, opacity: textOpacity }}>
            <HStack mb={6} spacing={4}>
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                letterSpacing="widest" 
                color="pink.400"
                textTransform="uppercase"
              >
                0{index + 1} — Top Airing
              </Text>
              <Box w="40px" h="1px" bg="whiteAlpha.400" />
            </HStack>
            
            <Heading 
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} 
              lineHeight="1.1" 
              mb={6}
              fontWeight="black"
              letterSpacing="tight"
              textShadow="0 20px 40px rgba(0,0,0,0.3)"
            >
              {anime.title_english || anime.title}
            </Heading>
            
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="whiteAlpha.900" 
              mb={10} 
              noOfLines={3} 
              lineHeight="tall"
              maxW="2xl"
              textShadow="0 2px 10px rgba(0,0,0,0.5)"
            >
              {anime.synopsis ? anime.synopsis.replace(/<[^>]*>?/gm, '') : ''}
            </Text>
            
            <HStack spacing={4}>
              <Box 
                px={6} 
                py={3} 
                border="1px solid" 
                borderColor="whiteAlpha.300" 
                borderRadius="full"
                bg="whiteAlpha.100"
                transition="all 0.3s"
                _hover={{ bg: "whiteAlpha.200", borderColor: "pink.400" }}
                cursor="default"
              >
                <Text fontSize="sm" fontWeight="medium">{anime.type}</Text>
              </Box>
              <Box 
                px={6} 
                py={3} 
                border="1px solid" 
                borderColor="whiteAlpha.300" 
                borderRadius="full" 
                display="flex" 
                alignItems="center" 
                gap={2}
                bg="whiteAlpha.100"
                transition="all 0.3s"
                _hover={{ bg: "whiteAlpha.200", borderColor: "yellow.400" }}
                cursor="default"
              >
                <Star size={16} fill="#ECC94B" color="#ECC94B" /> 
                <Text fontSize="sm" fontWeight="bold">{anime.score}</Text>
              </Box>
            </HStack>
          </MotionBox>
        </Flex>
        
        {/* Explore Button - Right Side */}
        <MotionBox 
          position="absolute" 
          right={{ base: 4, md: 0 }}
          bottom={{ base: "15%", md: "50%" }}
          transform={{ base: "none", md: "translateY(50%)" }}
          style={{ opacity: textOpacity }}
          zIndex={20}
        >
          <Link href={`/anime/${anime.mal_id}`} passHref>
            <Button
              size="lg"
              height="80px"
              width="80px"
              rounded="full"
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.400"
              color="white"
              _hover={{ 
                bg: "pink.500", 
                borderColor: "pink.500",
                transform: "scale(1.1)"
              }}
              transition="all 0.3s"
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <ArrowRight size={24} />
              <Text fontSize="xs" fontWeight="bold">View</Text>
            </Button>
          </Link>
        </MotionBox>
      </Container>
    </MotionBox>
  );
}

function Navigation({ total, progress, containerRef }: { total: number, progress: MotionValue<number>, containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      const index = Math.floor(latest * total);
      setActiveIndex(Math.min(index, total - 1));
    });
    return () => unsubscribe();
  }, [progress, total]);

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerTop = rect.top + scrollTop;
      
      const viewportHeight = window.innerHeight;
      const containerHeight = containerRef.current.scrollHeight;
      const scrollableDistance = containerHeight - viewportHeight;
      
      const targetProgress = index / total;
      const targetScrollY = containerTop + (targetProgress * scrollableDistance) + 1;
      
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Container 
      position="absolute" 
      bottom={10} 
      left={0} 
      right={0} 
      maxW="7xl" 
      zIndex={10}
    >
      <HStack spacing={8} borderTop="1px solid" borderColor="whiteAlpha.300" pt={6}>
        {Array.from({ length: total }).map((_, i) => (
          <Box 
            key={i} 
            cursor="pointer" 
            onClick={() => scrollToSlide(i)}
            position="relative"
            pb={2}
          >
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color={activeIndex === i ? "white" : "whiteAlpha.500"}
              transition="color 0.3s"
            >
              0{i + 1}
            </Text>
            {activeIndex === i && (
              <MotionBox
                layoutId="navIndicator"
                position="absolute"
                top="-25px" // Align with borderTop
                left={0}
                right={0}
                height="2px"
                bg="pink.500"
              />
            )}
          </Box>
        ))}
      </HStack>
    </Container>
  );
}
