'use client';

import { 
  Box, Flex, HStack, Link, IconButton, useDisclosure, Stack, Button, 
  InputGroup, InputLeftElement, Input, List, ListItem, Text, Image,
  useOutsideClick, useColorMode, useColorModeValue, Spinner, Avatar, useToken
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { JikanAnime, JikanManga } from '@/lib/anilist';
import { useAuth } from '@/context/AuthContext';
import { useJournal } from '@/context/JournalContext';
import { Menu, X, User, Search as SearchIcon, Sun, Moon, Plus, Check, BookOpen, Tv } from 'lucide-react';
import { useAnimeSearch } from '@/hooks/useAnimeSearch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box) as React.ComponentType<any>;

const Links = [
  { name: 'Home', path: '/' },
  { name: 'Library', path: '/library' },
  { name: 'Manga', path: '/manga' },
  { name: 'Schedule', path: '/schedule' },
  { name: 'Studio', path: '/studio' },
  { name: 'Journal', path: '/journal' },
  { name: 'Contact', path: '/contact' },
];

const NavLink = ({ children, path }: { children: React.ReactNode; path: string }) => {
  const pathname = usePathname();
  const isActive = path === '/' ? pathname === path : pathname.startsWith(path);
  
  const color = useColorModeValue('gray.800', 'gray.300'); // Made even darker for light mode
  const activeColor = useColorModeValue('pink.600', 'pink.300');
  const hoverBg = useColorModeValue('pink.50', 'whiteAlpha.100');
  const activeBg = useColorModeValue('pink.100', 'whiteAlpha.200');
  
  return (
  <Link
    as={NextLink}
    href={path}
    _hover={{ textDecoration: 'none' }}
  >
    <MotionBox
      px={4}
      py={2}
      position="relative"
      initial="rest"
      animate={isActive ? "active" : "rest"}
      whileHover="hover"
      cursor="pointer"
    >
      <MotionBox
        position="absolute"
        inset={0}
        bg={isActive ? activeBg : hoverBg}
        rounded={'full'}
        variants={{
          rest: { scale: 0.85, opacity: 0, y: 0 },
          hover: { scale: 1, opacity: 1, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
          active: { scale: 1, opacity: 1, y: 0, boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)" }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <MotionBox
        position="relative"
        zIndex={2}
        fontWeight="medium"
        // Move color out of variants to ensure it applies correctly
        color={isActive ? activeColor : color}
        variants={{
          rest: { y: 0 },
          hover: { color: activeColor, y: -1 },
          active: { y: 0 }
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </MotionBox>
    </MotionBox>
  </Link>
)};

const NavHoverBox = ({ children }: { children: React.ReactNode }) => {
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  
  return (
    <MotionBox
      position="relative"
      initial="rest"
      whileHover="hover"
    >
      <MotionBox
        position="absolute"
        inset={-1}
        bg={hoverBg}
        rounded={'full'}
        variants={{
          rest: { scale: 0.85, opacity: 0, y: 0 },
          hover: { scale: 1, opacity: 1, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      <MotionBox
        position="relative"
        zIndex={2}
        variants={{
          rest: { y: 0 },
          hover: { y: -1 },
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </MotionBox>
    </MotionBox>
  );
};

const Logo = () => {
  const text = "AniRealm";
  const [pink600, pink300, purple600, purple300] = useToken(
    'colors',
    ['pink.600', 'pink.300', 'purple.600', 'purple.300']
  );
  const pinkColor = useColorModeValue(pink600, pink300);
  const purpleColor = useColorModeValue(purple600, purple300);
  
  return (
    <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
      <MotionBox
        display="flex"
        alignItems="center"
        initial="rest"
        whileHover="hover"
        cursor="pointer"
        overflow="hidden"
        height="40px"
      >
        {text.split("").map((letter, i) => (
          <MotionBox
            key={i}
            color={pinkColor}
            sx={{ fontFamily: 'var(--font-changa-one), sans-serif !important' }}
            variants={{
              rest: { y: 0 },
              hover: { 
                y: -5, 
                color: purpleColor,
                transition: {
                  type: "spring",
                  damping: 10,
                  stiffness: 200,
                  delay: i * 0.05,
                }
              }
            }}
            fontSize="3xl"
            fontWeight="normal"
            letterSpacing="wide"
            style={{ display: 'inline-block' }}
          >
            {letter}
          </MotionBox>
        ))}
      </MotionBox>
    </Link>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentProfile } = useAuth();
  const { addEntry, entries } = useJournal();
  
  const {
      searchQuery,
      setSearchQuery,
      searchType,
      suggestions,
      loading,
      isSearchOpen,
      setIsSearchOpen,
      searchRef,
      handleSearchChange,
      handleSearchSubmit,
      toggleSearchType,
      handleSuggestionClick
  } = useAnimeSearch();

  const bg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.6)');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const iconColor = useColorModeValue('gray.800', 'white');
  const searchBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const searchColor = useColorModeValue('gray.800', 'white');
  const searchFocusBg = useColorModeValue('white', 'whiteAlpha.200');
  const dropdownBg = useColorModeValue('white', 'gray.800');
  const dropdownBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const dropdownHover = useColorModeValue('gray.100', 'whiteAlpha.100');
  const dropdownText = useColorModeValue('gray.800', 'white');
  const dropdownSubText = useColorModeValue('gray.800', 'white');

  useOutsideClick({
    ref: searchRef,
    handler: () => setIsSearchOpen(false),
  });

  const showSuggestions = isSearchOpen && (suggestions.length > 0 || loading);

  const handleAdd = (e: React.MouseEvent, item: JikanAnime | JikanManga) => {
    e.stopPropagation();
    addEntry({
        type: searchType,
        [searchType === 'anime' ? 'animeId' : 'mangaId']: item.mal_id,
        title: item.title,
        status: searchType === 'anime' ? 'Watching' : 'Reading',
        rating: 0,
        image: item.images.jpg.image_url,
    });
  };

  const isAdded = (id: number) => {
      return entries.some(e => 
          (searchType === 'anime' && e.animeId === id) || 
          (searchType === 'manga' && e.mangaId === id)
      );
  };

  return (
    <Box bg={bg} backdropFilter="saturate(180%) blur(20px)" px={4} position="fixed" top={0} left={0} w="full" zIndex="1000" borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          variant="ghost"
          color={iconColor}
          _hover={{ bg: 'whiteAlpha.200' }}
        >
            {isOpen ? <X /> : <Menu />}
        </IconButton>
        
        <HStack spacing={8} alignItems={'center'}>
          <Logo />
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link.name} path={link.path}>{link.name}</NavLink>
            ))}
          </HStack>
        </HStack>

        <Flex alignItems={'center'} gap={4}>
          {/* Search Bar */}
          <Box position="relative" ref={searchRef} display={{ base: 'none', sm: 'block' }}>
            <NavHoverBox>
              <form onSubmit={handleSearchSubmit}>
                <InputGroup size="sm" w="300px">
                  <InputLeftElement pointerEvents="none">
                    <Button 
                        size="xs" 
                        variant="ghost" 
                        color={searchColor} 
                        p={0}
                        _hover={{ bg: 'transparent' }}
                        onClick={toggleSearchType}
                        pointerEvents="auto"
                    >
                        {searchType === 'anime' ? <Tv size={14} /> : <BookOpen size={14} />}
                    </Button>
                  </InputLeftElement>
                  <Input 
                    placeholder={`Search ${searchType}...`} 
                    bg={searchBg} 
                    border="none" 
                    rounded="full"
                    color={searchColor}
                    pl={10}
                    _focus={{ bg: searchFocusBg, ring: 1, ringColor: 'pink.300' }}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
                  />
                </InputGroup>
              </form>
            </NavHoverBox>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
            {showSuggestions && (
              <MotionBox 
                position="absolute" 
                top="100%" 
                left={0} 
                right={0} 
                mt={2} 
                bg={dropdownBg} 
                borderRadius="md" 
                boxShadow="xl" 
                zIndex={1001}
                overflow="hidden"
                border="1px solid"
                borderColor={dropdownBorder}
                initial={{ opacity: 0, rotateX: -15, y: -10 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: -15, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "top", perspective: "1000px" }}
              >
                {loading ? (
                  <Flex justify="center" align="center" p={4}>
                    <Spinner size="sm" color="pink.500" />
                  </Flex>
                ) : (
                  <List spacing={0}>
                    {suggestions.map((item, index) => (
                      <MotionBox
                        as={ListItem}
                        key={item.mal_id} 
                        p={2} 
                        cursor="pointer"
                        onClick={() => handleSuggestionClick(item)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          backgroundColor: dropdownHover, 
                          x: 5, 
                          scale: 1.02, 
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          zIndex: 1
                        }}
                      >
                        <HStack justify="space-between">
                          <HStack>
                            <Image 
                                src={item.images.jpg.image_url || undefined} 
                                alt={item.title} 
                                boxSize="30px" 
                                objectFit="cover" 
                                borderRadius="sm" 
                                fallbackSrc="https://placehold.co/30x30?text=?"
                            />
                            <Box>
                                <Text fontSize="sm" color={dropdownText} fontWeight="bold" noOfLines={1}>{item.title_english || item.title}</Text>
                                <Text fontSize="xs" color={dropdownSubText}>{item.type}</Text>
                            </Box>
                          </HStack>
                          
                          {/* Quick Add Button */}
                          <IconButton
                             aria-label="Add to Journal"
                             icon={isAdded(item.mal_id) ? <Check size={14} /> : <Plus size={14} />}
                             size="xs"
                             variant="ghost"
                             colorScheme={isAdded(item.mal_id) ? "green" : "pink"}
                             onClick={(e) => handleAdd(e, item)}
                             isDisabled={isAdded(item.mal_id)}
                          />
                        </HStack>
                      </MotionBox>
                    ))}
                  </List>
                )}
              </MotionBox>
            )}
            </AnimatePresence>
          </Box>

          <NavHoverBox>
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
              color={iconColor}
              _hover={{ bg: 'transparent' }}
              rounded="full"
            />
          </NavHoverBox>

          <NavHoverBox>
            <Button
              as={NextLink}
              href="/profile"
              variant={'ghost'}
              color={useColorModeValue('gray.600', 'gray.300')}
              _hover={{ bg: 'transparent', color: useColorModeValue('pink.600', 'pink.300') }}
              size={'sm'}
              leftIcon={currentProfile ? undefined : <User size={16} />}
              rounded={'full'}
              fontWeight="medium"
              px={currentProfile ? 2 : 4}
            >
              {currentProfile ? (
                <HStack spacing={2}>
                  <Avatar size="xs" name={currentProfile.name} src={currentProfile.avatar} />
                  <Text display={{ base: 'none', md: 'block' }}>{currentProfile.name}</Text>
                </HStack>
              ) : (
                'Profile'
              )}
            </Button>
          </NavHoverBox>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} path={link.path}>{link.name}</NavLink>
            ))}
            <Box px={3}>
               <form onSubmit={handleSearchSubmit}>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon size={16} color="gray" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search anime..." 
                      bg={searchBg} 
                      border="none" 
                      color={searchColor}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
               </form>
            </Box>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
