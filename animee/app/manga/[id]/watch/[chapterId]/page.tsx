'use client';

import { Box, Container, Flex, Heading, Text, Spinner, Center, useColorModeValue, IconButton, Image } from '@chakra-ui/react';
import { getChapterPages, getMangaDetails, SuwayomiManga } from '@/lib/suwayomi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function MangaReader() {
  const params = useParams();
  const router = useRouter();
  const mangaId = Number(params.id);
  const chapterId = Number(params.chapterId); // Note: folder structure needs to be [id]/watch/[chapterId]

  const [pages, setPages] = useState<string[]>([]);
  const [manga, setManga] = useState<SuwayomiManga | null>(null);
  const [loading, setLoading] = useState(true);
  
  const bg = useColorModeValue('gray.50', 'black');
  const textColor = useColorModeValue('gray.800', 'white');
  const headerBg = useColorModeValue('whiteAlpha.900', 'black');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    const fetchData = async () => {
      if (!mangaId || !chapterId) return;
      try {
        const [mangaRes, pagesRes] = await Promise.all([
          getMangaDetails(mangaId),
          getChapterPages(mangaId, chapterId)
        ]);
        setManga(mangaRes);
        setPages(pagesRes);
      } catch (error) {
        console.error('Error fetching chapter pages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mangaId, chapterId]);

  if (loading) {
    return (
      <Center h="100vh" bg={bg}>
        <Spinner size="xl" color="pink.500" />
      </Center>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      {/* Minimal Header */}
      <Box position="fixed" top={0} left={0} right={0} zIndex={10} bg={headerBg} backdropFilter="blur(10px)" borderBottom="1px solid" borderColor={borderColor} px={4} py={3}>
        <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
          <Flex align="center" gap={4}>
            <IconButton 
              aria-label="Back" 
              icon={<ArrowLeft />} 
              variant="ghost" 
              onClick={() => router.back()}
            />
            <Box>
              <Heading size="sm" color={textColor} noOfLines={1}>{manga?.title}</Heading>
              <Text fontSize="xs" color="gray.500">Chapter Reader</Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Reader Content */}
      <Container maxW="4xl" pt={20} pb={20}>
        <Flex direction="column" align="center" gap={0}>
          {pages.map((url, index) => (
            <Image 
              key={index} 
              src={url} 
              alt={`Page ${index + 1}`} 
              w="100%" 
              loading="lazy"
              fallback={<Center h="500px" w="100%" bg="gray.800"><Spinner /></Center>}
            />
          ))}
        </Flex>
      </Container>

      {/* Navigation Footer (Optional) */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={10} bg={headerBg} backdropFilter="blur(10px)" borderTop="1px solid" borderColor={borderColor} px={4} py={3}>
        <Flex justify="center" gap={4}>
           {/* Logic for prev/next chapter would go here if we had the full chapter list in context */}
           <Text fontSize="sm" color="gray.500">Page 1 of {pages.length}</Text>
        </Flex>
      </Box>
    </Box>
  );
}
