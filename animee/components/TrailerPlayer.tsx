'use client';

import { useState } from 'react';
import { Box, Image, Icon, Flex } from '@chakra-ui/react';
import { Play } from 'lucide-react';

const CenterPosition = ({ children }: { children: React.ReactNode }) => (
    <Flex position="absolute" inset={0} align="center" justify="center">
        {children}
    </Flex>
);

export default function TrailerPlayer({ url, title }: { url: string, title: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    // Extract video ID from embed URL
    const videoId = url ? url.split('/').pop()?.split('?')[0] : '';
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

    if (isPlaying) {
        return (
             <iframe 
                src={`${url}?autoplay=1`} 
                title={title} 
                allowFullScreen 
                style={{ width: '100%', height: '100%', border: 0 }} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
        );
    }

    return (
        <Box 
            position="relative" 
            w="full" 
            h="full" 
            cursor="pointer" 
            onClick={() => setIsPlaying(true)}
            role="group"
            bg="black"
        >
            <Image 
                src={thumbnailUrl} 
                alt={title} 
                w="full" 
                h="full" 
                objectFit="cover" 
                opacity={0.8}
                _groupHover={{ opacity: 0.6 }}
                transition="all 0.3s"
                fallbackSrc="https://placehold.co/1280x720?text=Trailer"
            />
             <Box position="absolute" inset={0} bg="blackAlpha.300" _groupHover={{ bg: 'blackAlpha.100' }} transition="all 0.3s" />
            <CenterPosition>
                <Box 
                    bg="whiteAlpha.200" 
                    backdropFilter="blur(8px)" 
                    p={4} 
                    borderRadius="full" 
                    border="2px solid white"
                    _groupHover={{ transform: 'scale(1.1)', bg: 'whiteAlpha.400' }}
                    transition="all 0.3s"
                    boxShadow="0 0 20px rgba(0,0,0,0.5)"
                >
                    <Icon as={Play} boxSize={8} color="white" fill="white" ml={1} />
                </Box>
            </CenterPosition>
        </Box>
    );
}