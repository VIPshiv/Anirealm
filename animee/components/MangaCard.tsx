'use client';

import { Box, Image, Badge, Text, Stack, Heading, Button, LinkBox, LinkOverlay, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { JikanManga } from '@/lib/anilist';
import { useJournal } from '@/context/JournalContext';
import { Plus, Check } from 'lucide-react';
import NextLink from 'next/link';

const MotionBox = motion.create(Box);

export default function MangaCard({ manga }: { manga: JikanManga }) {
  const { addEntry, getEntry } = useJournal();
  const isAdded = !!getEntry(manga.mal_id, 'manga');

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdded) return;
    
    addEntry({
      type: 'manga',
      mangaId: manga.mal_id,
      title: manga.title_english || manga.title,
      chapter: 0,
      status: 'Plan to Read',
      rating: 0,
      image: manga.images.jpg.large_image_url
    });
  };

  return (
    <MotionBox
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      borderColor={borderColor}
      boxShadow="lg"
      position="relative"
      as={LinkBox}
    >
      <Image 
        src={manga.images.jpg.large_image_url || undefined} 
        alt={manga.title} 
        objectFit="cover" 
        h="350px" 
        w="100%" 
        fallbackSrc="https://placehold.co/200x350?text=No+Image"
      />

      <Box p="6">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="orange">
            {manga.type}
          </Badge>
          <Box
            color={textColor}
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {manga.chapters ? `${manga.chapters} ch` : 'Unknown'} &bull; {manga.status}
          </Box>
        </Box>

        <Heading mt="1" size="md" as="h4" lineHeight="tight" noOfLines={1} color={headingColor}>
          <LinkOverlay as={NextLink} href={`/manga/${manga.mal_id}`}>
            {manga.title_english || manga.title}
          </LinkOverlay>
        </Heading>

        <Text mt={2} color={textColor} fontSize="sm" noOfLines={3}>
          {manga.synopsis ? manga.synopsis.replace(/<[^>]*>?/gm, '') : ''}
        </Text>

        <Stack direction="row" mt={4} spacing={4} align="center">
           <Button 
            leftIcon={isAdded ? <Check size={16} /> : <Plus size={16} />} 
            colorScheme={isAdded ? "green" : "orange"} 
            variant={isAdded ? "solid" : "outline"} 
            size="sm"
            onClick={handleAdd}
            w="full"
            isDisabled={isAdded}
            _hover={!isAdded ? { bg: 'orange.500', color: 'white', borderColor: 'orange.500' } : undefined}
          >
            {isAdded ? "Added" : "Add to Library"}
          </Button>
        </Stack>
      </Box>
    </MotionBox>
  );
}
