'use client';

import { Box } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

const StudioScene = dynamic(() => import('@/components/studio/StudioScene'), { 
  ssr: false,
  loading: () => <Box h="100vh" w="full" bg="black" />
});

export default function Studio() {
  return (
    <Box h="100vh" overflow="hidden" position="relative">
      <Box position="fixed" top={0} left={0} right={0} zIndex={10} pointerEvents="none">
        <Box pointerEvents="auto">
          <Navbar />
        </Box>
      </Box>
      <StudioScene />
    </Box>
  );
}
