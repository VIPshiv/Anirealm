'use client';

import { Box, Skeleton, SkeletonText, SkeletonCircle, useColorModeValue } from '@chakra-ui/react';

export default function AnimeCardSkeleton() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      borderColor={borderColor}
      boxShadow="sm"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      {/* Image Skeleton */}
      <Skeleton height="250px" width="100%" />

      <Box p="6" flex="1">
        <Box display="flex" alignItems="baseline">
          {/* Badge Skeleton */}
          <Skeleton height="20px" width="60px" borderRadius="full" mr="2" />
          {/* Stats Skeleton */}
          <Skeleton height="15px" width="80px" />
        </Box>

        {/* Title Skeleton */}
        <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight="6" />

        {/* Synopsis Skeleton */}
        <SkeletonText mt="4" noOfLines={3} spacing="2" skeletonHeight="3" />
        
        {/* Button Skeleton */}
        <Skeleton mt="4" height="40px" width="100%" borderRadius="md" />
      </Box>
    </Box>
  );
}
