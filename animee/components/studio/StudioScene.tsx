'use client';

import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import StudioExperience from './StudioExperience';
import StudioOverlay from './StudioOverlay';
import { Suspense } from 'react';
import { Box, Spinner, Center, useColorModeValue, ChakraProvider } from '@chakra-ui/react';
import theme from '@/app/theme';

export default function StudioScene() {
  const isDark = useColorModeValue(false, true);

  return (
    <Box h="100vh" w="full" position="fixed" top={0} left={0} right={0}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <ScrollControls pages={7} damping={0.2}>
            {/* 3D Content that moves with scroll */}
            <StudioExperience isDark={isDark} />
            
            {/* HTML Overlay that scrolls */}
            <Scroll html style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
              <ChakraProvider theme={theme}>
                <StudioOverlay />
              </ChakraProvider>
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
      
      {/* Loading State */}
      <Suspense fallback={
        <Center position="absolute" inset={0} bg={useColorModeValue('gray.50', 'gray.900')} zIndex={10}>
          <Spinner size="xl" color="pink.500" />
        </Center>
      }>
        {/* Trigger suspense */}
      </Suspense>
    </Box>
  );
}
