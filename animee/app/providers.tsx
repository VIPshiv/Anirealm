'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, Box, Text, Flex, Icon, createStandaloneToast } from '@chakra-ui/react';
import { ReactNode } from 'react';
import theme from './theme';
import { JournalProvider } from '@/context/JournalContext';
import { AuthProvider } from '@/context/AuthContext';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const CustomToast = (props: any) => {
  const { status, title, description, onClose } = props;
  
  let bg = 'gray.800';
  let accentColor = 'pink.500';
  let IconComp = Info;
  
  switch (status) {
    case 'success':
      accentColor = 'pink.500';
      IconComp = Check;
      break;
    case 'error':
      accentColor = 'red.500';
      IconComp = X;
      break;
    case 'warning':
      accentColor = 'orange.400';
      IconComp = AlertTriangle;
      break;
    case 'info':
      accentColor = 'blue.400';
      IconComp = Info;
      break;
  }

  return (
    <Box
      color="white"
      p={3}
      bg={bg}
      borderRadius="md"
      boxShadow="lg"
      borderLeft="4px solid"
      borderColor={accentColor}
      display="flex"
      alignItems="center"
      position="relative"
      minW="300px"
      onClick={onClose}
      cursor="pointer"
      my={2}
    >
        <Flex 
          bg={accentColor} 
          w={6} 
          h={6} 
          borderRadius="full" 
          align="center" 
          justify="center" 
          mr={3}
        >
           <Icon as={IconComp} boxSize={4} color="white" />
        </Flex>
        
        <Box flex="1">
            <Text fontWeight="bold" fontSize="sm">{title}</Text>
            {description && <Text fontSize="xs" mt={1} color="gray.300">{description}</Text>}
        </Box>
    </Box>
  );
};

const { ToastContainer } = createStandaloneToast();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme} toastOptions={{
        defaultOptions: {
            position: 'bottom-right',
            duration: 3000,
            isClosable: true,
            render: (props) => <CustomToast {...props} />
        }
      }}>
        <AuthProvider>
          <JournalProvider>
            {children}
          </JournalProvider>
        </AuthProvider>
        <ToastContainer />
      </ChakraProvider>
    </CacheProvider>
  );
}
