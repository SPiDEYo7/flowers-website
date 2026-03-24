'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function CardMesh({
  isOpen,
  frontTexture,
}: {
  isOpen: boolean;
  frontTexture?: string;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const coverRef  = useRef<THREE.Mesh>(null!);
  const targetRot = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle floating
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;

    // Open/close cover
    targetRot.current = isOpen ? -Math.PI * 0.85 : 0;
    if (coverRef.current) {
      coverRef.current.rotation.y += (targetRot.current - coverRef.current.rotation.y) * 0.06;
    }
  });

  const coverMat = new THREE.MeshStandardMaterial({ color: '#FF4D6D', roughness: 0.3, metalness: 0.1, side: THREE.FrontSide });
  const innerMat = new THREE.MeshStandardMaterial({ color: '#FFF8F0', roughness: 0.5, side: THREE.BackSide });
  const pageMat  = new THREE.MeshStandardMaterial({ color: '#FFF8F0', roughness: 0.5 });

  return (
    <group ref={groupRef}>
      {/* Back half of card (static) */}
      <RoundedBox args={[2, 2.8, 0.04]} radius={0.06} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#FF85A1" roughness={0.3} />
      </RoundedBox>

      {/* Inner page */}
      <RoundedBox args={[1.9, 2.7, 0.02]} radius={0.05} smoothness={4} position={[0, 0, 0.03]}>
        <primitive object={pageMat} attach="material" />
      </RoundedBox>

      {/* Cover (rotates open) */}
      <group position={[-1, 0, 0]} ref={coverRef as any}>
        <group position={[1, 0, 0]}>
          <RoundedBox args={[2, 2.8, 0.05]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#FF4D6D" roughness={0.25} metalness={0.15} side={THREE.FrontSide} />
          </RoundedBox>
          {/* Cover inner face */}
          <RoundedBox args={[1.95, 2.75, 0.01]} radius={0.05} smoothness={4} position={[0, 0, -0.03]}>
            <meshStandardMaterial color="#FFB3C6" roughness={0.5} side={THREE.BackSide} />
          </RoundedBox>
          {/* Heart emboss on cover */}
          <mesh position={[0, 0.3, 0.03]}>
            <torusGeometry args={[0.3, 0.1, 8, 24]} />
            <meshStandardMaterial color="#FF2D78" roughness={0.2} metalness={0.3} emissive="#FF2D78" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function FloatingSparkles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 60;
  const positions = new Float32Array(
    Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 3,
    ]).flat()
  );

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export function RotatingCard({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.5} color="#fff5f8" castShadow />
      <pointLight position={[-3, 3, 2]} intensity={0.5} color="#C8B6E2" />
      <pointLight position={[3, -3, 2]} intensity={0.3} color="#FFB3C6" />

      <CardMesh isOpen={isOpen} />
      <FloatingSparkles />

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
