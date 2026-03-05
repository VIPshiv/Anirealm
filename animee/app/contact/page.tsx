'use client';

import {
  Box,
  Container,
  Stack,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  VStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { StaggeredText, SlideUpFade, BlurReveal } from '@/components/TextAnimations';
import { Send, Mail, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const bgColor = useColorModeValue('gray.50', 'black');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }, 1500);
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Box pt={24} pb={12}>
        <Container maxW="4xl">
        <Stack spacing={12}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center">
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              style={{ 
                perspective: "1000px",
                cursor: "default",
                display: "inline-block"
              }}
            >
              <BlurReveal 
                as="h1" 
                fontSize={{ base: '4xl', md: '6xl' }} 
                fontWeight="bold"
                bgGradient="linear(to-r, pink.400, purple.500)"
                bgClip="text"
                _hover={{
                  bgGradient: "linear(to-r, purple.500, pink.400)",
                  textShadow: "0 0 30px rgba(236, 72, 153, 0.3)"
                }}
                style={{ transition: "all 0.3s ease" }}
              >
                Get in Touch
              </BlurReveal>
            </motion.div>
            <SlideUpFade delay={0.2}>
              <StaggeredText fontSize="xl" color="gray.500" maxW="2xl">
                Have a suggestion, query, or just want to say hi? We&apos;d love to hear from you.
              </StaggeredText>
            </SlideUpFade>
          </VStack>

          {/* Contact Form & Info */}
          <Stack 
            direction={{ base: 'column', md: 'row' }} 
            spacing={8} 
            align="start"
          >
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ width: '100%', flex: 2 }}
            >
              <Box
                bg={cardBg}
                p={8}
                rounded="2xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
                position="relative"
                overflow="hidden"
              >
                {/* Decorative gradient blob */}
                <Box
                  position="absolute"
                  top="-50%"
                  right="-50%"
                  width="100%"
                  height="100%"
                  bgGradient="radial(pink.200, transparent)"
                  opacity={0.2}
                  filter="blur(40px)"
                  zIndex={0}
                />

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input 
                        placeholder="Your Name" 
                        size="lg" 
                        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                        border="none"
                        _focus={{ ring: 2, ringColor: 'pink.400' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        size="lg"
                        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                        border="none"
                        _focus={{ ring: 2, ringColor: 'pink.400' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Message</FormLabel>
                      <Textarea 
                        placeholder="Tell us what's on your mind..." 
                        size="lg" 
                        rows={6}
                        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                        border="none"
                        _focus={{ ring: 2, ringColor: 'pink.400' }}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      width="full"
                      colorScheme="pink"
                      bgGradient="linear(to-r, pink.400, purple.500)"
                      isLoading={isLoading}
                      loadingText="Sending..."
                      _hover={{
                        bgGradient: "linear(to-r, pink.500, purple.600)",
                        transform: "translateY(-2px)",
                        shadow: "lg"
                      }}
                      leftIcon={<Icon as={Send} />}
                    >
                      Send Message
                    </Button>
                  </VStack>
                </form>
              </Box>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ width: '100%', flex: 1 }}
            >
              <VStack spacing={6} align="stretch">
                <Box 
                  p={6} 
                  bg={cardBg} 
                  rounded="xl" 
                  shadow="md"
                  border="1px"
                  borderColor={borderColor}
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <Stack direction="row" align="center" spacing={4}>
                    <Box p={3} bg="pink.100" color="pink.500" rounded="lg">
                      <Icon as={Mail} boxSize={6} />
                    </Box>
                    <Box>
                      <SlideUpFade as="h3" fontWeight="bold" fontSize="lg">Email Us</SlideUpFade>
                      <SlideUpFade as="p" color="gray.500" fontSize="sm" delay={0.1}>support@anirealm.com</SlideUpFade>
                    </Box>
                  </Stack>
                </Box>

                <Box 
                  p={6} 
                  bg={cardBg} 
                  rounded="xl" 
                  shadow="md"
                  border="1px"
                  borderColor={borderColor}
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <Stack direction="row" align="center" spacing={4}>
                    <Box p={3} bg="purple.100" color="purple.500" rounded="lg">
                      <Icon as={MessageSquare} boxSize={6} />
                    </Box>
                    <Box>
                      <SlideUpFade as="h3" fontWeight="bold" fontSize="lg">Community</SlideUpFade>
                      <SlideUpFade as="p" color="gray.500" fontSize="sm" delay={0.1}>Join our Discord server</SlideUpFade>
                    </Box>
                  </Stack>
                </Box>

                <Box 
                  p={6} 
                  bg={cardBg} 
                  rounded="xl" 
                  shadow="md"
                  border="1px"
                  borderColor={borderColor}
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <Stack direction="row" align="center" spacing={4}>
                    <Box p={3} bg="blue.100" color="blue.500" rounded="lg">
                      <Icon as={User} boxSize={6} />
                    </Box>
                    <Box>
                      <SlideUpFade as="h3" fontWeight="bold" fontSize="lg">Support</SlideUpFade>
                      <SlideUpFade as="p" color="gray.500" fontSize="sm" delay={0.1}>24/7 Customer Support</SlideUpFade>
                    </Box>
                  </Stack>
                </Box>
              </VStack>
            </motion.div>
          </Stack>
        </Stack>
      </Container>
      </Box>
      <Footer />
    </Box>
  );
}