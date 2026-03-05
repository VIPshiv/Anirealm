'use client';

import { Box, Container, Stack, Text, Link, useColorModeValue, SimpleGrid, Flex, Divider } from '@chakra-ui/react';
import { Github, Twitter, Instagram } from 'lucide-react';
import NextLink from 'next/link';

export default function Footer() {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const color = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const headingColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      bg={bg}
      color={color}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
    >
      <Container as={Stack} maxW={'7xl'} py={10}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {/* Brand & Socials */}
          <Stack spacing={6}>
            <Box>
              <Text fontSize={'2xl'} fontWeight={'bold'} color={headingColor} fontFamily="heading">
                Anirealm
              </Text>
              <Text fontSize={'sm'} mt={2}>
                Experience your favorite anime in a new light.
              </Text>
            </Box>
            <Stack direction={'row'} spacing={6}>
              <Link href={'https://github.com'} isExternal _hover={{ color: 'pink.400' }}><Github size={20} /></Link>
              <Link href={'https://twitter.com'} isExternal _hover={{ color: 'pink.400' }}><Twitter size={20} /></Link>
              <Link href={'https://instagram.com'} isExternal _hover={{ color: 'pink.400' }}><Instagram size={20} /></Link>
            </Stack>
          </Stack>

          {/* Navigation Links */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>Platform</Text>
            <Link as={NextLink} href={'/'} _hover={{ color: 'pink.400' }}>Home</Link>
            <Link as={NextLink} href={'/library'} _hover={{ color: 'pink.400' }}>Library</Link>
            <Link as={NextLink} href={'/journal'} _hover={{ color: 'pink.400' }}>Journal</Link>
            <Link as={NextLink} href={'/schedule'} _hover={{ color: 'pink.400' }}>Schedule</Link>
          </Stack>

          {/* Support Links */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>Support</Text>
            <Link as={NextLink} href={'/contact'} _hover={{ color: 'pink.400' }}>Contact Us</Link>
            <Link as={NextLink} href={'#'} _hover={{ color: 'pink.400' }}>Terms of Service</Link>
            <Link as={NextLink} href={'#'} _hover={{ color: 'pink.400' }}>Privacy Policy</Link>
            <Link as={NextLink} href={'#'} _hover={{ color: 'pink.400' }}>DMCA</Link>
          </Stack>

          {/* Disclaimer text in main grid */}
          <Stack align={'flex-start'}>
            <Text fontWeight={'500'} fontSize={'lg'} mb={2} color={headingColor}>Legal</Text>
             <Text fontSize={'sm'} lineHeight="tall">
               Anirealm does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
             </Text>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Box borderTopWidth={1} borderStyle={'solid'} borderColor={borderColor}>
        <Container
          as={Stack}
          maxW={'7xl'}
          py={6}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          {/* Site Copyright */}
          <Text fontSize="sm">© 2026 Anirealm. Website design and code property of Anirealm.</Text>
          
          {/* Content Property Disclaimer */}
          <Text fontSize="xs" color={useColorModeValue('gray.800', 'white')} textAlign={{ base: 'center', md: 'right' }} maxW="500px">
            All rights to the anime, manga, and characters mentioned or displayed on this site belong to their respective copyright owners. 
            We do not claim ownership of any content.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
