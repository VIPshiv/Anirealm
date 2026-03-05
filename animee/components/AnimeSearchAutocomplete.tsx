'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Image,
  Spinner,
  useColorModeValue,
  useOutsideClick,
  Badge,
  Flex
} from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import { searchAnime, searchManga, JikanAnime, JikanManga } from '@/lib/anilist';
import { Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface AnimeSearchAutocompleteProps {
  type: 'anime' | 'manga';
  placeholder?: string;
  onSelect: (item: JikanAnime | JikanManga) => void;
  inputBg?: string;
  inputColor?: string;
}

export default function AnimeSearchAutocomplete({
  type,
  placeholder,
  onSelect,
  inputBg,
  inputColor,
}: AnimeSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<(JikanAnime | JikanManga)[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownBg = useColorModeValue('white', 'gray.800');
  const dropdownBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const dropdownHover = useColorModeValue('gray.100', 'whiteAlpha.100');
  const dropdownText = useColorModeValue('gray.800', 'white');
  const dropdownSubText = useColorModeValue('gray.800', 'white');

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        if (type === 'anime') {
          const res = await searchAnime({ q: debouncedQuery, page: 1, limit: 10 });
          const unique = Array.from(new Map(res.data.map(item => [item.mal_id, item])).values());
          setSuggestions(unique);
        } else {
          const res = await searchManga(debouncedQuery, 1);
          const unique = Array.from(new Map(res.data.map(item => [item.mal_id, item])).values());
          setSuggestions(unique.slice(0, 10));
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, type]);

  const handleSelect = (item: JikanAnime | JikanManga) => {
    setQuery(item.title);
    setIsOpen(false);
    onSelect(item);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Box position="relative" ref={containerRef} w="full">
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder || `Search ${type}...`}
        bg={inputBg}
        color={inputColor}
        border="none"
        _focus={{ boxShadow: '0 0 0 2px rgba(66, 153, 225, 0.6)' }}
      />

      <AnimatePresence>
        {isOpen && (query.length >= 3 || loading) && (
          <MotionBox
            position="absolute"
            top="calc(100% + 8px)"
            left={0}
            right={0}
            bg={dropdownBg}
            borderRadius="lg"
            boxShadow="2xl"
            border="1px"
            borderColor={dropdownBorder}
            maxH="400px"
            overflowY="auto"
            zIndex={1000}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            data-lenis-prevent
            onWheel={(e: React.WheelEvent) => e.stopPropagation()}
          >
            {loading ? (
              <Flex justify="center" align="center" py={8}>
                <Spinner size="md" color="pink.500" thickness="3px" />
              </Flex>
            ) : suggestions.length > 0 ? (
              <VStack spacing={0} align="stretch">
                {suggestions.map((item) => (
                  <Box
                    key={item.mal_id}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: dropdownHover }}
                    onClick={() => handleSelect(item)}
                    transition="background 0.2s"
                  >
                    <HStack spacing={3} align="start">
                      <Image
                        src={item.images.jpg.small_image_url || item.images.jpg.image_url}
                        alt={item.title}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                        flexShrink={0}
                      />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={dropdownText}
                          noOfLines={2}
                          lineHeight="1.3"
                        >
                          {item.title}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          {item.type && (
                            <Badge colorScheme="purple" fontSize="xs">
                              {item.type}
                            </Badge>
                          )}
                          {item.score && (
                            <HStack spacing={1}>
                              <Star size={12} fill="currentColor" color="#F6E05E" />
                              <Text fontSize="xs" color={dropdownSubText} fontWeight="medium">
                                {item.score}
                              </Text>
                            </HStack>
                          )}
                          {'episodes' in item && item.episodes && (
                            <Text fontSize="xs" color={dropdownSubText}>
                              {item.episodes} eps
                            </Text>
                          )}
                          {'chapters' in item && item.chapters && (
                            <Text fontSize="xs" color={dropdownSubText}>
                              {item.chapters} chapters
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Flex justify="center" align="center" py={8} px={4}>
                <VStack spacing={2}>
                  <Search size={32} color="gray" opacity={0.3} />
                  <Text fontSize="sm" color={dropdownSubText}>
                    No results found for &ldquo;{query}&rdquo;
                  </Text>
                </VStack>
              </Flex>
            )}
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
