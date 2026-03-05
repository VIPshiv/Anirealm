'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  useColorModeValue,
  FormControl,
  FormLabel,
  Checkbox,
  Divider,
  HStack,
  Link,
  useColorMode,
  IconButton,
  useToast,
  VStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

const MotionBox = motion(Box);

export default function LoginPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showResetPasswordInput, setShowResetPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const inputBorder = useColorModeValue('gray.200', 'gray.700');
  const inputColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!showResetPasswordInput) {
        if (!email) {
           toast({ title: 'Please enter your email', status: 'warning', duration: 3000, isClosable: true });
           return;
        }
        setShowResetPasswordInput(true);
      } else {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.msg || 'Something went wrong');
          
          toast({
            title: 'Password Updated',
            description: 'You can now login with your new password.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          setIsForgotPassword(false);
          setShowResetPasswordInput(false);
          setIsLogin(true);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          toast({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Something went wrong');
      }

      if (isLogin) {
        login(data.token, data.user);
        toast({
          title: 'Login Successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/');
      } else {
        register(data.token, data.user);
        toast({
          title: 'Registration Successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Left Side - Image/Branding */}
      <Flex
        flex={1}
        bg="black"
        position="relative"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {/* Background Image */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('/pxfuel.jpg')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.6}
        />
        
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.800"
          opacity={0.9}
        />

        {/* Content */}
        <VStack
          position="relative"
          zIndex={1}
          spacing={6}
          p={12}
          align="flex-start"
          maxW="lg"
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HStack spacing={3} mb={4}>
              <Sparkles color="white" size={32} />
              <Heading color="white" size="2xl" fontWeight="black" letterSpacing="tight">
                ANIMEE
              </Heading>
            </HStack>
            <Heading color="white" size="3xl" lineHeight="1.2" mb={4}>
              Your Gateway to the Anime World
            </Heading>
            <Text color="whiteAlpha.900" fontSize="xl" lineHeight="tall">
              Join millions of fans. Track your progress, discover new favorites, and connect with the community.
            </Text>
          </MotionBox>
        </VStack>
      </Flex>

      {/* Right Side - Form */}
      <Flex
        flex={1}
        bg={bgColor}
        alignItems="center"
        justifyContent="center"
        p={{ base: 8, md: 12, lg: 24 }}
        position="relative"
      >
        <Box position="absolute" top={4} right={4}>
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            onClick={toggleColorMode}
            variant="ghost"
            rounded="full"
          />
        </Box>

        <Box w="full" maxW="md">
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={8} align="stretch">
              <VStack align="start" spacing={2}>
                <Heading size="xl" color={textColor}>
                  {isForgotPassword 
                    ? (showResetPasswordInput ? 'Set New Password' : 'Reset Password')
                    : isLogin 
                      ? 'Welcome back' 
                      : 'Create an account'}
                </Heading>
                <Text color={subTextColor} fontSize="md">
                  {isForgotPassword 
                    ? (showResetPasswordInput ? 'Enter your new password below' : 'Enter your email to receive a reset link')
                    : isLogin 
                      ? "Don't have an account?" 
                      : "Already have an account?"}{' '}
                  {!isForgotPassword && (
                    <Link 
                      color="pink.400" 
                      fontWeight="bold"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Sign up for free' : 'Log in'}
                    </Link>
                  )}
                </Text>
              </VStack>

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  {!isLogin && !isForgotPassword && (
                    <FormControl id="username" isRequired>
                      <FormLabel color={textColor}>Username</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <User size={20} color="gray" />
                        </InputLeftElement>
                        <Input
                          placeholder="johndoe"
                          bg={inputBg}
                          border="1px solid"
                          borderColor={inputBorder}
                          color={inputColor}
                          _focus={{ ring: 2, ringColor: 'pink.400', borderColor: 'pink.400' }}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </InputGroup>
                    </FormControl>
                  )}
                  
                  <FormControl id="email" isRequired>
                    <FormLabel color={textColor}>Email address</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Mail size={20} color="gray" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={inputBorder}
                        color={inputColor}
                        _focus={{ ring: 2, ringColor: 'pink.400', borderColor: 'pink.400' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                  
                  {(!isForgotPassword || showResetPasswordInput) && (
                    <FormControl id="password" isRequired>
                      <FormLabel color={textColor}>{isForgotPassword ? "New Password" : "Password"}</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Lock size={20} color="gray" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          bg={inputBg}
                          border="1px solid"
                          borderColor={inputBorder}
                          color={inputColor}
                          _focus={{ ring: 2, ringColor: 'pink.400', borderColor: 'pink.400' }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            color="gray.500"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  )}
                  
                  {isLogin && !isForgotPassword && (
                    <Flex w="full" justify="space-between" align="center">
                      <Checkbox colorScheme="pink" color={subTextColor}>Remember me</Checkbox>
                      <Link color="pink.400" fontSize="sm" fontWeight="medium" onClick={() => setIsForgotPassword(true)}>
                        Forgot password?
                      </Link>
                    </Flex>
                  )}

                  {isForgotPassword && (
                    <Flex w="full" justify="flex-end" align="center">
                      <Link color="pink.400" fontSize="sm" fontWeight="medium" onClick={() => setIsForgotPassword(false)}>
                        Back to Login
                      </Link>
                    </Flex>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    bgGradient="linear(to-r, pink.400, purple.500)"
                    color="white"
                    _hover={{
                      bgGradient: 'linear(to-r, pink.500, purple.600)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                    mt={2}
                  >
                    {isForgotPassword 
                      ? (showResetPasswordInput ? 'Update Password' : 'Send Reset Link') 
                      : (isLogin ? 'Sign in' : 'Create Account')}
                  </Button>
                </VStack>
              </Box>

              <HStack>
                <Divider />
                <Text fontSize="sm" color={subTextColor} whiteSpace="nowrap">
                  Or continue with
                </Text>
                <Divider />
              </HStack>

              <Button
                w="full"
                size="lg"
                variant="outline"
                leftIcon={<GoogleIcon />}
                bg={cardBg}
                color={textColor}
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                Google
              </Button>
              
              <Flex justify="center" mt={4}>
                <Link as={NextLink} href="/" color={subTextColor} fontSize="sm" _hover={{ color: 'pink.400' }}>
                  ← Back to Home
                </Link>
              </Flex>
            </VStack>
          </MotionBox>
        </Box>
      </Flex>
    </Flex>
  );
}

const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.147-1.133 8.213-3.293 2.093-2.133 2.733-5.387 2.733-8.213 0-.573-.067-1.147-.16-1.68H12.48z" fill="currentColor"/>
  </svg>
);
