'use client';

import { useState } from 'react';
import { 
  Box, VStack, HStack, Text, Avatar, Textarea, Button, 
  IconButton, Divider, useColorModeValue, Flex, Badge 
} from '@chakra-ui/react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, MoreVertical } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user: "AnimeFan99",
    avatar: "https://bit.ly/dan-abramov",
    content: "This episode was insane! The animation quality dropped a bit in the middle but that ending made up for it completely.",
    timestamp: "2 hours ago",
    likes: 45,
    dislikes: 2,
    replies: 5
  },
  {
    id: 2,
    user: "MangaReader",
    avatar: "https://bit.ly/tioluwani-kolawole",
    content: "For those wondering, this covers chapter 145-147 of the manga. They skipped a few dialogue scenes but overall a faithful adaptation.",
    timestamp: "5 hours ago",
    likes: 128,
    dislikes: 0,
    replies: 12
  },
  {
    id: 3,
    user: "CasualViewer",
    avatar: "https://bit.ly/kent-c-dodds",
    content: "Can someone explain what happened at 12:30? I'm confused about the power system.",
    timestamp: "1 day ago",
    likes: 12,
    dislikes: 1,
    replies: 3
  }
];

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.800', 'white');

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      user: "You",
      avatar: "", // Empty avatar will show default
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      dislikes: 0,
      replies: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (id: number) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        if (c.isLiked) {
          return { ...c, likes: c.likes - 1, isLiked: false };
        } else {
          return { 
            ...c, 
            likes: c.likes + 1, 
            isLiked: true,
            // Remove dislike if exists
            dislikes: c.isDisliked ? c.dislikes - 1 : c.dislikes,
            isDisliked: false
          };
        }
      }
      return c;
    }));
  };

  const handleDislike = (id: number) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        if (c.isDisliked) {
          return { ...c, dislikes: c.dislikes - 1, isDisliked: false };
        } else {
          return { 
            ...c, 
            dislikes: c.dislikes + 1, 
            isDisliked: true,
            // Remove like if exists
            likes: c.isLiked ? c.likes - 1 : c.likes,
            isLiked: false
          };
        }
      }
      return c;
    }));
  };

  return (
    <Box bg={bg} borderRadius="md" borderWidth="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>Comments</Text>
          <Badge colorScheme="pink" borderRadius="full" px={2}>{comments.length}</Badge>
        </HStack>
        <Flex gap={2}>
           <Button size="sm" variant="ghost">Top</Button>
           <Button size="sm" variant="ghost">Newest</Button>
        </Flex>
      </HStack>

      {/* Input Area */}
      <Flex gap={4} mb={8}>
        <Avatar size="md" name="You" src="" />
        <Box flex={1}>
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Join the discussion..."
            bg={inputBg}
            border="none"
            _focus={{ ring: 2, ringColor: 'pink.500' }}
            rows={3}
            mb={2}
            color={textColor}
          />
          <Flex justify="flex-end">
            <Button 
              colorScheme="pink" 
              size="sm" 
              leftIcon={<Send size={14} />}
              onClick={handlePostComment}
              isDisabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </Flex>
        </Box>
      </Flex>

      <Divider mb={6} />

      {/* Comments List */}
      <VStack spacing={6} align="stretch">
        {comments.map((comment) => (
          <Flex key={comment.id} gap={4}>
            <Avatar size="md" name={comment.user} src={comment.avatar} />
            <Box flex={1}>
              <HStack justify="space-between" mb={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="sm" color={textColor}>{comment.user}</Text>
                  <Text fontSize="xs" color={subTextColor}>{comment.timestamp}</Text>
                </HStack>
                <IconButton 
                  aria-label="More options" 
                  icon={<MoreVertical size={14} />} 
                  size="xs" 
                  variant="ghost" 
                />
              </HStack>
              
              <Text fontSize="sm" color={textColor} mb={3} lineHeight="tall">
                {comment.content}
              </Text>

              <HStack spacing={4}>
                <HStack spacing={1}>
                  <IconButton 
                    aria-label="Like" 
                    icon={<ThumbsUp size={14} fill={comment.isLiked ? "currentColor" : "none"} />} 
                    size="xs" 
                    variant="ghost"
                    colorScheme={comment.isLiked ? "pink" : "gray"}
                    onClick={() => handleLike(comment.id)}
                  />
                  <Text fontSize="xs" color={subTextColor}>{comment.likes}</Text>
                </HStack>
                
                <HStack spacing={1}>
                  <IconButton 
                    aria-label="Dislike" 
                    icon={<ThumbsDown size={14} fill={comment.isDisliked ? "currentColor" : "none"} />} 
                    size="xs" 
                    variant="ghost"
                    colorScheme={comment.isDisliked ? "red" : "gray"}
                    onClick={() => handleDislike(comment.id)}
                  />
                  {comment.dislikes > 0 && <Text fontSize="xs" color={subTextColor}>{comment.dislikes}</Text>}
                </HStack>

                <Button 
                  size="xs" 
                  variant="ghost" 
                  leftIcon={<MessageSquare size={14} />}
                  color={subTextColor}
                >
                  Reply {comment.replies > 0 && `(${comment.replies})`}
                </Button>
              </HStack>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}