'use client';

import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({ 
  config,
  fonts: {
    heading: 'var(--font-potta-one), sans-serif',
    body: 'var(--font-potta-one), sans-serif',
    accent: 'var(--font-potta-one), sans-serif',
    hand: 'var(--font-potta-one), sans-serif',
    logo: 'var(--font-alfa-slab-one), cursive',
    mono: 'var(--font-potta-one), sans-serif',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode('gray.50', 'black')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
      },
    }),
  },
  colors: {
    // Overriding standard gray with the requested Purple/Indigo tinted scale
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#121212', // Darker Card Surface
      900: '#000000', // Pure Black Background
    },
    // Keep brand and accent pink/purple for identity
    brand: {
      50: '#fdf2f8',
      100: '#fbcfe8',
      200: '#f9a8d4',
      300: '#f472b6',
      400: '#f14ed9',
      500: '#ec4899', // Primary
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    accent: {
      100: '#EC4899', // Updated Accent Pink
      200: '#A855F7', // Updated Accent Purple
    }
  },
});

export default theme;
