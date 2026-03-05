'use client';

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Select, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Heading, IconButton, useColorModeValue, Image } from '@chakra-ui/react';
import { useJournal } from '@/context/JournalContext';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionTr = motion(Tr);
const MotionBox = motion(Box);
const MotionSelect = motion(Select);
const MotionInput = motion(Input);

export default function MangaTracker() {
  const { entries, addEntry, removeEntry } = useJournal();

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [status, setStatus] = useState('Reading');
  const [rating, setRating] = useState('');

  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const inputColor = useColorModeValue('gray.800', 'white');
  const tableHeaderColor = useColorModeValue('gray.800', 'white');
  const tableCellColor = useColorModeValue('gray.800', 'white');
  const tableCellSubColor = useColorModeValue('gray.800', 'white');
  const tableColorScheme = useColorModeValue('gray', 'whiteAlpha');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntry({
      type: 'manga',
      title,
      chapter: parseInt(chapter) || 0,
      status,
      rating: parseInt(rating) || 0,
    });
    setTitle('');
    setChapter('');
    setRating('');
  };

  const mangaEntries = entries.filter(e => e.type === 'manga');

  return (
    <Box w="full">
      <MotionBox 
        bg={bg} 
        p={6} 
        borderRadius="lg" 
        mb={8} 
        border="1px" 
        borderColor={borderColor}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading size="md" color={headingColor} mb={4}>Add Manga Entry</Heading>
        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <FormControl isRequired>
              <FormLabel color={labelColor}>Manga Title</FormLabel>
              <MotionInput 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Solo Leveling"
                bg={inputBg}
                color={inputColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
                transition={{ duration: 0.2 }}
              />
            </FormControl>
            
            <HStack gap={4}>
              <FormControl>
                <FormLabel color={labelColor}>Chapter</FormLabel>
                <MotionInput 
                  type="number" 
                  value={chapter} 
                  onChange={(e) => setChapter(e.target.value)} 
                  placeholder="0"
                  bg={inputBg}
                  color={inputColor}
                  borderColor={borderColor}
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
                  transition={{ duration: 0.2 }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={labelColor}>Status</FormLabel>
                <MotionSelect 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  bg={inputBg}
                  color={inputColor}
                  borderColor={borderColor}
                  whileHover={{ scale: 1.05, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95, y: 0, boxShadow: "none" }}
                  transition={{ duration: 0.2 }}
                >
                  <option value="Reading">Reading</option>
                  <option value="Completed">Completed</option>
                  <option value="Plan to Read">Plan to Read</option>
                  <option value="Dropped">Dropped</option>
                </MotionSelect>
              </FormControl>
              
              <FormControl>
                <FormLabel color={labelColor}>Rating</FormLabel>
                <MotionInput 
                  type="number" 
                  min="0" 
                  max="10" 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)} 
                  placeholder="0-10"
                  bg={inputBg}
                  color={inputColor}
                  borderColor={borderColor}
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.6)" }}
                  transition={{ duration: 0.2 }}
                />
              </FormControl>
            </HStack>
            
            <Button type="submit" colorScheme="blue" size="lg" mt={2}>
              Add to Journal
            </Button>
          </VStack>
        </form>
      </MotionBox>

      <Box overflowX="auto" bg={bg} borderRadius="lg" border="1px" borderColor={borderColor} data-lenis-prevent>
        <Table variant="simple" colorScheme={tableColorScheme}>
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th color={tableHeaderColor}>Cover</Th>
              <Th color={tableHeaderColor}>Title</Th>
              <Th color={tableHeaderColor}>Chapter</Th>
              <Th color={tableHeaderColor}>Status</Th>
              <Th color={tableHeaderColor} isNumeric>Rating</Th>
              <Th color={tableHeaderColor}></Th>
            </Tr>
          </Thead>
          <Tbody>
            <AnimatePresence>
            {mangaEntries.map((entry) => (
              <MotionTr 
                key={entry.id} 
                _hover={{ bg: rowHoverBg }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Td>
                  {entry.image && (
                    <Image 
                      src={entry.image} 
                      alt={entry.title} 
                      boxSize="50px" 
                      objectFit="cover" 
                      borderRadius="md" 
                    />
                  )}
                </Td>
                <Td fontWeight="medium" color={tableCellColor}>{entry.title}</Td>
                <Td color={tableCellSubColor}>Ch. {entry.chapter}</Td>
                <Td>
                  <Badge 
                    colorScheme={
                      entry.status === 'Completed' ? 'green' : 
                      entry.status === 'Reading' ? 'blue' : 
                      entry.status === 'Dropped' ? 'red' : 'gray'
                    }
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {entry.status}
                  </Badge>
                </Td>
                <Td isNumeric color={tableCellColor} fontWeight="bold">
                  {entry.rating > 0 ? entry.rating : '-'}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Delete entry"
                    icon={<Trash2 size={18} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeEntry(entry.id)}
                  />
                </Td>
              </MotionTr>
            ))}
            </AnimatePresence>
            {mangaEntries.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8} color={tableCellSubColor}>
                  No manga entries yet. Start tracking!
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
