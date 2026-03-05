'use client';

import { Box, Heading, Container, Text, Button, Stack, useColorModeValue, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import { StaggeredText, TypewriterText, MotionH2 } from './TextAnimations';
import NextLink from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box) as React.ComponentType<any>;

export default function Hero() {
  const [init, setInit] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // Darker/More saturated pinks for light mode validity, Lighter pastel pinks for dark mode contrast
  const particleColors = useColorModeValue(
    ["#E91E63", "#D81B60", "#F06292", "#F48FB1"], 
    ["#FFC0CB", "#FFB7B2", "#FF69B4", "#E91E63"]
  );

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      // Delay mounting the particles engine to avoid frame drops during text animation
      setTimeout(() => {
        setInit(true);
        setShowParticles(true);
      }, 2000);
    });
  }, []);

  return (
    <Box position="relative" height="100vh" display="flex" alignItems="center" overflow="hidden">
      {/* Background Particles - Sakura Theme */}
      {init && (
        <MotionBox 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          zIndex={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: showParticles ? 1 : 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
           <Particles
            id="tsparticles"
            options={{
              background: {
                color: {
                  value: "transparent",
                },
              },
              fpsLimit: 120,
              interactivity: {
                events: {
                  onClick: {
                    enable: false,
                    mode: "push",
                  },
                  onHover: {
                    enable: true,
                    mode: "repulse",
                  },
                },
                modes: {
                  push: {
                    quantity: 4,
                  },
                  repulse: {
                    distance: 100,
                    duration: 0.4,
                  },
                },
              },
              particles: {
                color: {
                  value: particleColors,
                },
                links: {
                  enable: false, 
                },
                move: {
                  direction: "bottom-right",
                  enable: true,
                  outModes: {
                    default: "out",
                  },
                  random: true,
                  speed: 2,
                  straight: false,
                },
                number: {
                  density: {
                    enable: true,
                  },
                  value: 120,
                },
                opacity: {
                  value: { min: 0.6, max: 1 },
                  animation: {
                    enable: true,
                    speed: 0.5,
                    sync: false
                  }
                },
                shape: {
                  type: "image",
                  options: {
                    image: {
                      src: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgODUgQzUwIDg1IDIwIDY1IDIwIDM1IEMyMCAxNSAzNSAxMCA0NSAyMCBDNDggMjMgNTAgMjUgNTAgMjUgQzUwIDI1IDUyIDIzIDU1IDIwIEM2NSAxMCA4MCAxNSA4MCAzNSBDODAgNjUgNTAgODUgNTAgODUiIGZpbGw9IiNGRkMwQ0IiLz48L3N2Zz4=",
                      width: 100,
                      height: 100,
                      replaceColor: true
                    }
                  }
                },
                rotate: {
                  value: { min: 0, max: 360 },
                  animation: {
                    enable: true,
                    speed: 5,
                    sync: false
                  },
                  direction: "random"
                },
                size: {
                  value: { min: 15, max: 25 },
                  animation: {
                    enable: true,
                    speed: 2,
                    sync: false,
                    startValue: "random"
                  }
                },
                roll: {
                  darken: {
                    enable: true,
                    value: 25
                  },
                  enable: true,
                  speed: {
                    min: 5,
                    max: 15
                  }
                },
              },
              detectRetina: true,
            }}
          />
        </MotionBox>
      )}

      <Container maxW={'3xl'} zIndex={1} position="relative">
        <Stack
          as={Box}
          textAlign={'center'}
          gap={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Box>
            <StaggeredText
              fontWeight={800}
              fontSize={{ base: '3xl', sm: '5xl', md: '7xl' }}
              lineHeight={'110%'}
              color={headingColor}
              letterSpacing="tight"
              justifyContent="center"
              fontFamily="body"
            >
              Experience Anime
            </StaggeredText>
            <MotionH2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              fontWeight={800}
              fontSize={{ base: '3xl', sm: '5xl', md: '7xl' }}
              lineHeight={'110%'}
              letterSpacing="tight"
              textAlign="center"
              fontFamily="body"
            >
              <Text 
                as={'span'} 
                bgGradient="linear(to-r, pink.400, purple.500)" 
                bgClip="text"
              >
                Like Never Before
              </Text>
            </MotionH2>
          </Box>
          
          <TypewriterText 
            color="pink.500" 
            maxW={'2xl'} 
            mx={'auto'} 
            fontSize={'xl'} 
            fontWeight="medium"
            delay={1}
          >
            Track your journey, discover hidden gems, and immerse yourself in the artistry of animation. A premium platform for the true anime connoisseur.
          </TypewriterText>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Stack
              direction={'row'}
              gap={4}
              align={'center'}
              alignSelf={'center'}
              position={'relative'}
              justifyContent={'center'}
            >
              <Button
                as={NextLink}
                href="/library"
                colorScheme={'pink'}
                bgGradient="linear(to-r, pink.400, purple.500)"
                rounded={'full'}
                px={8}
                size="lg"
                _hover={{
                  bgGradient: "linear(to-r, pink.500, purple.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
              <Button 
                as={NextLink}
                href="/contact"
                variant={'link'} 
                colorScheme={'pink'} 
                size={'lg'}
              >
                Learn more
              </Button>
            </Stack>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
}
