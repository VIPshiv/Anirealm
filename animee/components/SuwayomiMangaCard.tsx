'use client';

import { Box, Image, Badge, Text, Heading, LinkBox, LinkOverlay, useColorModeValue, AspectRatio } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { SuwayomiManga, getMangaIconUrl } from '@/lib/suwayomi';
import NextLink from 'next/link';

const MotionBox = motion.create(Box);

export default function SuwayomiMangaCard({ manga, inLibrary }: { manga: SuwayomiManga, inLibrary?: boolean }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const headingColor = useColorModeValue('gray.800', 'white');

  return (
    <MotionBox
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      borderRadius="xl"
      overflow="hidden"
      bg={bg}
      boxShadow="md"
      position="relative"
      as={LinkBox}
      role="group"
      opacity={inLibrary ? 0.8 : 1}
    >
      <AspectRatio ratio={2/3}>
        <Box position="relative" w="100%" h="100%">
          <Image 
            src={getMangaIconUrl(manga.id)} 
            alt={manga.title} 
            objectFit="cover" 
            w="100%" 
            h="100%"
            transition="transform 0.3s"
            _groupHover={{ transform: 'scale(1.05)' }}
            filter={inLibrary ? 'grayscale(40%)' : 'none'}
            fallbackSrc="https://placehold.co/200x300?text=No+Image"
          />
          {inLibrary && (
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              bottom={0} 
              bg="blackAlpha.600" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                IN LIBRARY
              </Badge>
            </Box>
          )}
        </Box>
      </AspectRatio>

      <Box p="4" position="absolute" bottom="0" left="0" right="0" bgGradient="linear(to-t, blackAlpha.900, transparent)" pt={12}>
        <LinkOverlay as={NextLink} href={`/manga/${manga.id}`}>
          <Heading size="sm" color="white" noOfLines={2} mb={1}>
            {manga.title}
          </Heading>
        </LinkOverlay>
        <Text fontSize="xs" color="whiteAlpha.800" noOfLines={1}>
          {manga.author || 'Unknown Author'}
        </Text>
      </Box>
    </MotionBox>
  );
}
