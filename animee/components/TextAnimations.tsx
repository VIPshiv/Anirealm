'use client';

import { motion, Variants } from 'framer-motion';
import { HeadingProps, TextProps, useColorModeValue, chakra, Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionBox = motion.create(Box) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionH1 = motion.create(Heading) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionH2 = motion.create(Heading) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionH3 = motion.create(Heading) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionP = motion.create(Text) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MotionSpan = motion.create(Text) as React.ComponentType<any>;

// 1. Staggered Text Reveal (Great for Hero Headings)
export const StaggeredText = ({ children, ...props }: HeadingProps & { children: string }) => {
  const words = children.split(" ");
  // Remove defaultColor here to let parent control color fully via props, 
  // or fall back to theme default if not provided.
  // If we want a default, we should check if props.color is present.

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.2, 0.65, 0.3, 0.9], // Custom ease for smooth entry
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <MotionH2
      as="h2"
      variants={container}
      initial="hidden"
      animate="visible"
      display="flex"
      flexWrap="wrap"
      gap="0.25em"
      cursor="default"
      {...props}
    >
      {words.map((word, index) => (
        <MotionSpan 
          as="span"
          key={index} 
          variants={child} 
          display='inline-block'
          color='inherit'
          whileHover={{ 
            scale: 1.05, 
            rotate: index % 2 === 0 ? 2 : -2,
            color: "#D53F8C", // pink.500
            textShadow: "0px 0px 8px rgba(213, 63, 140, 0.6)",
            transition: { duration: 0.2, ease: "easeOut" } 
          }}
          whileTap={{ scale: 0.95 }}
        >
          {word}
        </MotionSpan>
      ))}
    </MotionH2>
  );
};

// 2. Slide Up Fade (Reliable for Section Headers)
export const SlideUpFade = ({ children, delay = 0, as = 'div', ...props }: HeadingProps & { children: React.ReactNode, delay?: number, as?: any }) => {
  // Rely on parent prop for color, or chakra defaults
  
  // Dynamically choose the component based on the 'as' prop to ensure correct HTML nesting and motion props support
  const Component = as === 'h1' ? MotionH1 : 
                    as === 'h2' ? MotionH2 : 
                    as === 'h3' ? MotionH3 : 
                    as === 'p' ? MotionP : 
                    MotionBox;

  // Map 'as' proper to ensure underlying Chakra component knows what to render
  const asProp = as === 'h1' || as === 'h2' || as === 'h3' || as === 'p' ? as : undefined;

  return (
    <Component
      as={asProp}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ x: 10, color: "#D53F8C" }} // pink.500
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      cursor="default"
      {...props}
    >
      {children}
    </Component>
  );
};

// 3. Blur Reveal (Elegant for Page Titles)
export const BlurReveal = ({ children, ...props }: HeadingProps & { children: React.ReactNode }) => {
  return (
    <MotionH1
      as="h1"
      initial={{ filter: "blur(10px)", opacity: 0, scale: 0.95 }}
      animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, letterSpacing: "0.05em" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      cursor="default"
      {...props}
    >
      {children}
    </MotionH1>
  );
};

// 4. Typewriter Effect (For descriptions)
export const TypewriterText = ({ children, delay = 0, color, ...props }: TextProps & { children: string, delay?: number }) => {
  const themeDefault = useColorModeValue('gray.600', 'gray.300');
  const finalColor = color || themeDefault;

  // Split text into characters
  const characters = children.split("");
  
  return (
    <MotionP
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ color: "#D53F8C" }} // pink.500
      transition={{ duration: 0.5, delay }}
      cursor="default"
      color={finalColor}
      {...props}
    >
      {characters.map((char, index) => (
        <MotionSpan
          as="span"
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.05, delay: delay + index * 0.01 }}
          color='inherit'
        >
          {char}
        </MotionSpan>
      ))}
    </MotionP>
  );
};
