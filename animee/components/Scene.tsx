'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, TorusKnot } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

function RotatingTorus() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <TorusKnot ref={meshRef} args={[1, 0.3, 128, 16]}>
      <meshStandardMaterial color="#4299e1" roughness={0.1} metalness={0.8} />
    </TorusKnot>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingTorus />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}
