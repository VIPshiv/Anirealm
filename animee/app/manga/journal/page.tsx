'use client';

import { Box, Container, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MangaTracker from '@/components/MangaTracker';

const MotionContainer = motion(Container);

export default function MangaJournal() {
  const bg = useColorModeValue('gray.50', 'black');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <MotionContainer 
        maxW="5xl" 
        py={24}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading color={textColor} mb={4}>Manga Journal</Heading>
        <Text color={subTextColor} mb={12}>Track your manga reading progress manually.</Text>
        <MangaTracker />
      </MotionContainer>
      <Footer />
    </Box>
  );
}
