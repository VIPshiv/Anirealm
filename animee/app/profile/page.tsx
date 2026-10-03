'use client';

import { 
  Box, Container, Heading, Text, VStack, HStack, Avatar, 
  Button, useColorModeValue, Flex, Icon, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalBody, ModalCloseButton, 
  Input, useDisclosure, useToast, Switch, FormControl, FormLabel 
} from '@chakra-ui/react';
import { Plus, Lock, User, Smile } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Profile } from '@/context/AuthContext';

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // New Profile State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfilePin, setNewProfilePin] = useState('');
  const [isKids, setIsKids] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  
  const router = useRouter();
  const toast = useToast();
  const { token, selectProfile, loading, logout } = useAuth();

  const bg = useColorModeValue('gray.50', 'black');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.800', 'white');

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles', {
        headers: { 'x-auth-token': token! }
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    } else if (token) {
      fetchProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading, router]);

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) {
        toast({ title: 'Profile name is required', status: 'warning' });
        return;
    }

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token! 
        },
        body: JSON.stringify({
          name: newProfileName,
          isKids,
          pin: newProfilePin,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfileName}` // Auto-generate avatar
        })
      });

      if (res.ok) {
        const updatedProfiles = await res.json();
        setProfiles(updatedProfiles);
        onAddClose();
        setNewProfileName('');
        setNewProfilePin('');
        setIsKids(false);
        toast({ title: 'Profile created', status: 'success' });
      } else {
        let errorMsg = 'Error creating profile';
        try {
          const data = await res.json();
          errorMsg = data.msg || errorMsg;
        } catch {
          errorMsg = `Server Error: ${res.status} ${res.statusText}`;
        }
        toast({ title: errorMsg, status: 'error' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Server connection failed', status: 'error' });
    }
  };

  const handleProfileClick = (profile: Profile) => {
    if (isEditing) return; // Don't enter if editing mode

    if (profile.pin) {
      setSelectedProfileId(profile._id);
      onOpen();
    } else {
      loginProfile(profile);
    }
  };

  const loginProfile = (profile: Profile) => {
    selectProfile(profile);
    toast({
      title: `Welcome back, ${profile.name}!`,
      status: 'success',
      duration: 2000,
    });
    // Redirect is handled in AuthContext or we can do it here if needed, 
    // but selectProfile usually just sets state. 
    // Let's force redirect to home just in case.
    router.push('/');
  };

  const handlePinSubmit = () => {
    const profile = profiles.find(p => p._id === selectedProfileId);
    if (profile && profile.pin === pinInput) {
      loginProfile(profile);
      onClose();
      setPinInput('');
    } else {
      toast({
        title: 'Incorrect PIN',
        status: 'error',
        duration: 2000,
      });
    }
  };

  return (
    <Box bg={bg} minH="100vh" display="flex" flexDirection="column" justifyContent="center" position="relative">
      <Flex position="absolute" top={4} right={4} gap={2}>
        <Button 
          onClick={() => router.push('/login')}
          variant="ghost"
          color={subTextColor}
          _hover={{ color: textColor, bg: 'whiteAlpha.200' }}
        >
          Login
        </Button>
        <Button 
          onClick={logout}
          variant="ghost"
          color={subTextColor}
          _hover={{ color: textColor, bg: 'whiteAlpha.200' }}
        >
          Logout
        </Button>
      </Flex>
      <Container maxW="container.lg" textAlign="center">
        <Heading color={textColor} size="2xl" mb={12}>Who&apos;s watching?</Heading>
        
        <Flex justify="center" wrap="wrap" gap={8} mb={16}>
          {profiles.map((profile) => (
            <VStack 
              key={profile._id} 
              spacing={4} 
              cursor="pointer"
              onClick={() => handleProfileClick(profile)}
              role="group"
              position="relative"
            >
              <Box 
                position="relative" 
                transition="transform 0.2s"
                _groupHover={{ transform: 'scale(1.05)' }}
              >
                <Avatar 
                  size="2xl" 
                  name={profile.name} 
                  src={profile.avatar}
                  border="4px solid"
                  borderColor="transparent"
                  _groupHover={{ borderColor: 'white' }}
                  icon={profile.isKids ? <Smile size={40} /> : <User size={40} />}
                  bg={profile.isKids ? 'yellow.400' : 'pink.500'}
                />
                {isEditing && (
                  <Box 
                    position="absolute" 
                    inset={0} 
                    bg="blackAlpha.600" 
                    borderRadius="full" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <Icon as={Lock} color="white" boxSize={8} />
                  </Box>
                )}
                {profile.pin && !isEditing && (
                  <Flex
                    position="absolute"
                    bottom={0}
                    right={0}
                    bg="gray.900"
                    p={1}
                    borderRadius="full"
                    border="2px solid white"
                  >
                    <Lock size={16} color="white" />
                  </Flex>
                )}
              </Box>
              <Text 
                color={subTextColor} 
                fontSize="xl" 
                _groupHover={{ color: textColor, fontWeight: 'bold' }}
              >
                {profile.name}
              </Text>
            </VStack>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <VStack 
              spacing={4} 
              cursor="pointer"
              onClick={onAddOpen}
              role="group"
            >
              <Flex
                w="128px"
                h="128px"
                borderRadius="full"
                bg="transparent"
                border="2px dashed"
                borderColor="gray.500"
                align="center"
                justify="center"
                transition="all 0.2s"
                _groupHover={{ bg: 'whiteAlpha.100', borderColor: 'white' }}
              >
                <Plus size={48} color="gray" />
              </Flex>
              <Text 
                color={subTextColor} 
                fontSize="xl"
                _groupHover={{ color: textColor, fontWeight: 'bold' }}
              >
                Add Profile
              </Text>
            </VStack>
          )}
        </Flex>

        <Button 
          variant="outline" 
          colorScheme="gray" 
          size="lg"
          px={8}
          letterSpacing="widest"
          borderColor={subTextColor}
          color={subTextColor}
          _hover={{ borderColor: textColor, color: textColor }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'DONE' : 'MANAGE PROFILES'}
        </Button>
      </Container>

      {/* PIN Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} color={textColor}>
          <ModalHeader textAlign="center">Enter Profile PIN</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color={subTextColor}>
                Please enter the PIN to access this profile.
              </Text>
              <HStack justify="center">
                <Input 
                  type="password" 
                  maxLength={4}
                  textAlign="center"
                  fontSize="2xl"
                  letterSpacing="1rem"
                  w="200px"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                  autoFocus
                />
              </HStack>
              <Button colorScheme="pink" w="full" onClick={handlePinSubmit}>
                Enter
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Profile Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} color={textColor}>
          <ModalHeader>Add Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input 
                  placeholder="Profile Name" 
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="kids-mode" mb="0">
                  Kid&apos;s Profile?
                </FormLabel>
                <Switch id="kids-mode" isChecked={isKids} onChange={(e) => setIsKids(e.target.checked)} />
              </FormControl>

              <FormControl>
                <FormLabel>PIN (Optional)</FormLabel>
                <Input 
                  type="password" 
                  maxLength={4} 
                  placeholder="4-digit PIN"
                  value={newProfilePin}
                  onChange={(e) => setNewProfilePin(e.target.value)}
                />
              </FormControl>

              <Button colorScheme="pink" w="full" onClick={handleAddProfile}>
                Create Profile
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
