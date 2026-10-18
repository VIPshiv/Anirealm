'use client';

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ScrollDrivenTopAiring from "@/components/ScrollDrivenTopAiring";
import { 
  ContinueWatchingSection, 
  SeasonalSection, 
  MostPopularSection, 
  RandomAnimeSection, 
  BrowseByGenreSection,
  UpcomingSection
} from "@/components/HomeSections";
import { Box, useColorModeValue, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";

// Use Incremental Static Regeneration (ISR) to cache the page for 1 hour (3600 seconds)
// This improves performance significantly compared to force-dynamic

export default function Home() {
  const bgVal = useColorModeValue('gray.50', 'black');
  const contentBgVal = useColorModeValue('white', 'black');
  const bg = bgVal;
  const contentBg = contentBgVal;

  const { loading, token } = useAuth();

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="pink.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Hero />
      <Box position="relative" zIndex={1} bg={contentBg} mt="-50px" pt="50px" borderTopRadius="3xl">
        {token && <ContinueWatchingSection />}
        <SeasonalSection />
        <ScrollDrivenTopAiring />
        <MostPopularSection />
        <RandomAnimeSection />
        <BrowseByGenreSection />
        <UpcomingSection />
      </Box>
      <Footer />
    </Box>
  );
}
