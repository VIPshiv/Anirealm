'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, Image, Text, Float, Stars, Sparkles, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { Group } from 'three';

const AnimeCard = ({ position, url, title, rotation, textColor = 'white' }: { position: [number, number, number], url: string, title: string, rotation: [number, number, number], textColor?: string }) => {
  const ref = useRef<Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (ref.current) {
      // Idle animation
      ref.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
      
      // Hover effect
      const targetScale = hovered ? 1.2 : 1;
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
  });

  return (
    <group 
      ref={ref} 
      position={position} 
      rotation={rotation}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image url={url} scale={[3, 4]} transparent opacity={0.9} />
      <Text 
        position={[0, -2.5, 0]} 
        fontSize={0.3} 
        color={textColor} 
        anchorX="center" 
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={textColor === 'white' ? 'black' : 'white'}
      >
        {title}
      </Text>
    </group>
  );
};

const Title3D = ({ text, position, color, size = 1 }: { text: string, position: [number, number, number], color: string, size?: number }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </Float>
  );
};

const Poster = ({ url, position, rotation }: { url: string, position: [number, number, number], rotation: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  useFrame((state, delta) => {
    if (ref.current) {
      const targetScale = hovered ? 1.1 : 1;
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image 
        ref={ref}
        url={url} 
        scale={[2, 3]} 
        transparent 
        opacity={0.8}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      />
    </group>
  );
};

export default function StudioExperience({ isDark = true }: { isDark?: boolean }) {
  const scroll = useScroll();
  const { height } = useThree((state) => state.viewport);
  const groupRef = useRef<Group>(null);
  const textColor = isDark ? 'white' : 'black';

  useFrame(() => {
    if (groupRef.current) {
      // Move the entire group up as we scroll down
      groupRef.current.position.y = scroll.offset * height * 3;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      
      {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      <Sparkles count={200} scale={15} size={6} speed={0.4} opacity={0.6} color={isDark ? "#ff69b4" : "#d53f8c"} />

      {/* Section 1: The Portal */}
      <group position={[0, 0, 0]}>
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <Torus args={[3.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#d53f8c" emissive="#d53f8c" emissiveIntensity={2} />
          </Torus>
        </Float>
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <Ring args={[3.8, 3.9, 64]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#4299e1" emissive="#4299e1" emissiveIntensity={1} side={THREE.DoubleSide} />
          </Ring>
        </Float>
        <Title3D text="WELCOME" position={[0, 0.5, 0]} color={isDark ? "white" : "black"} size={1} />
        <Title3D text="TO THE STUDIO" position={[0, -0.5, 0]} color="#d53f8c" size={0.5} />
      </group>

      {/* Section 2: Floating Cards (PRESERVED) */}
      <group position={[0, -height, 0]}>
        <AnimeCard 
          position={[-2.5, 0, 0]} 
          rotation={[0, 0.3, 0]} 
          url="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80" 
          title="Action" 
          textColor={textColor}
        />
        <AnimeCard 
          position={[0, 0, 1]} 
          rotation={[0, 0, 0]} 
          url="https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=800&q=80" 
          title="Adventure" 
          textColor={textColor}
        />
        <AnimeCard 
          position={[2.5, 0, 0]} 
          rotation={[0, -0.3, 0]} 
          url="https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=80" 
          title="Fantasy" 
          textColor={textColor}
        />
      </group>

      {/* Section 3: The Hall of Legends (3D Titles) */}
      <group position={[0, -height * 2, 0]}>
         <Title3D text="LEGENDS" position={[0, 2, -2]} color="#f6e05e" size={1.5} />
         
         <Title3D text="ONE PIECE" position={[-3, 0, 0]} color="#e53e3e" size={0.6} />
         <Title3D text="NARUTO" position={[3, 0.5, 1]} color="#ed8936" size={0.6} />
         <Title3D text="BLEACH" position={[-2, -1.5, 2]} color="#000000" size={0.6} />
         <Title3D text="DRAGON BALL" position={[2, -1, -1]} color="#ecc94b" size={0.6} />
         
         <Sparkles count={50} scale={10} size={10} speed={0.5} opacity={0.5} color="gold" />
      </group>

      {/* Section 4: The Gallery (Poster Wall) */}
      <group position={[0, -height * 3, 0]}>
        <Title3D text="DISCOVER" position={[0, 2.5, 0]} color={isDark ? "white" : "black"} size={0.8} />
        
        {/* Left Wall */}
        <Poster url="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80" position={[-3, 0, 0]} rotation={[0, 0.5, 0]} />
        <Poster url="https://images.unsplash.com/photo-1626544827763-d516dce335e2?auto=format&fit=crop&w=800&q=80" position={[-4, 0, -2]} rotation={[0, 0.5, 0]} />
        
        {/* Right Wall */}
        <Poster url="https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=800&q=80" position={[3, 0, 0]} rotation={[0, -0.5, 0]} />
        <Poster url="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80" position={[4, 0, -2]} rotation={[0, -0.5, 0]} />

        {/* Center */}
        <Poster url="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80" position={[0, -1, 1]} rotation={[0, 0, 0]} />
      </group>
    </group>
  );
}
