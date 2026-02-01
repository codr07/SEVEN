import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars } from '@react-three/drei';
import type { Mesh } from 'three';

function FloatingShape({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

export function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <FloatingShape position={[-4, 2, 0]} color="#00ffff" />
      <FloatingShape position={[4, -2, -2]} color="#ff00ff" />
      <FloatingShape position={[0, 4, -5]} color="#7c3aed" />
    </>
  );
}
