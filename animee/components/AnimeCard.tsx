'use client';

import { Box, Badge, Text, Stack, Heading, Button, LinkBox, LinkOverlay, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image'; // Migrated to Next.js Image
import { motion } from 'framer-motion';
import { JikanAnime } from '@/lib/anilist';
import { useJournal } from '@/context/JournalContext';
import { Plus, Check } from 'lucide-react';
import NextLink from 'next/link';

const MotionBox = motion.create(Box);

export default function AnimeCard({ anime }: { anime: JikanAnime }) {
  const { addEntry, getEntry } = useJournal();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const headingColor = useColorModeValue('gray.800', 'white');

  const isAdded = !!getEntry(anime.mal_id, 'anime');

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
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
    <MotionBox
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.3 }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      borderColor={borderColor}
      boxShadow="lg"
      position="relative"
      as={LinkBox}
      h="100%"
      display="flex"
      flexDirection="column"
      role="group"
    >
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

      <Box position="relative" height="250px" width="100%" overflow="hidden">
        <Image 
          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
          alt={anime.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // Basic blur placeholder
          style={{ objectFit: 'cover' }}
        />
      </Box>

      <Box p="6" display="flex" flexDirection="column" flex="1">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {anime.studios?.[0]?.name || 'Unknown'}
          </Badge>
          <Box
            color={textColor}
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {anime.episodes || '?'} eps &bull; {anime.score || 'N/A'} ★
          </Box>
        </Box>

        <Heading mt="1" size="md" as="h4" lineHeight="tight" noOfLines={1} color={headingColor}>
          <LinkOverlay as={NextLink} href={`/anime/${anime.mal_id}?title=${encodeURIComponent(anime.title)}`}>
            {anime.title_english || anime.title}
          </LinkOverlay>
        </Heading>

        <Text mt={2} color={textColor} fontSize="sm" noOfLines={3} mb="auto">
          {anime.synopsis ? anime.synopsis.replace(/<[^>]*>?/gm, '') : ''}
        </Text>

        <Stack direction="row" mt={4} gap={2} mb={4} flexWrap="wrap">
          {anime.genres?.slice(0, 3).map((genre) => (
            <Badge key={genre.mal_id} colorScheme="purple" variant="outline">
              {genre.name}
            </Badge>
          ))}
        </Stack>

        <Button 
          leftIcon={isAdded ? <Check size={16} /> : <Plus size={16} />} 
          colorScheme={isAdded ? "green" : "pink"} 
          variant={isAdded ? "solid" : "outline"} 
          size="sm" 
          w="full"
          onClick={handleAdd}
          isDisabled={isAdded}
          _hover={!isAdded ? { bg: 'pink.500', color: 'white', borderColor: 'pink.500' } : undefined}
          zIndex={2}
          position="relative"
        >
          {isAdded ? "Added" : "Add to Journal"}
        </Button>
      </Box>
    </MotionBox>
  );
}
