'use client';

import { Menu, MenuButton, MenuList, MenuItem, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronDown, Check } from 'lucide-react';

export const FilterMenu = ({ 
  value, 
  onChange, 
  placeholder, 
  options,
  showAllOption = true,
  size = "md"
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string; 
  options: { value: string | number; label: string }[];
  showAllOption?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const bg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.800', 'white');
  const menuBg = useColorModeValue('white', '#18181b'); // Zinc-900ish for dark mode
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const selectedBg = useColorModeValue('gray.200', 'whiteAlpha.300'); // Neutral selected state
  
  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || placeholder;

  return (
    <Menu matchWidth autoSelect={false}>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDown size={16} />}
        bg={bg}
        color={textColor}
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
        width="100%"
        textAlign="left"
        fontWeight="medium"
        justifyContent="space-between"
        px={4}
        size={size}
      >
        <Text noOfLines={1} display="block" flex="1" textAlign="left">
          {selectedLabel}
        </Text>
      </MenuButton>
      <MenuList 
        bg={menuBg} 
        borderColor={borderColor} 
        boxShadow="lg"
        maxH="300px" 
        overflowY="auto" 
        zIndex={20}
        p={1}
      >
        {showAllOption && (
          <MenuItem 
            onClick={() => onChange('')} 
            borderRadius="md"
            mb={1}
            bg={!value ? selectedBg : 'transparent'}
            fontWeight={!value ? 'bold' : 'normal'}
            _hover={{ bg: hoverBg }}
            justifyContent="space-between"
          >
            {placeholder} (All)
            {!value && <Check size={14} />}
          </MenuItem>
        )}
        {options.map((opt) => {
          const isSelected = String(opt.value) === String(value);
          return (
            <MenuItem 
              key={opt.value} 
              onClick={() => onChange(String(opt.value))}
              bg={isSelected ? selectedBg : 'transparent'}
              borderRadius="md"
              fontWeight={isSelected ? 'bold' : 'normal'}
              _hover={{ bg: !isSelected ? hoverBg : undefined }} // Don't hover-change if selected
              justifyContent="space-between"
            >
              {opt.label}
              {isSelected && <Check size={14} />}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};
