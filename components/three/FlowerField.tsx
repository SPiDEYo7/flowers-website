'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Single Flower Mesh ─────────────────────────────────────────────────────
function Flower({
  position,
  color,
  scale,
  speed,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const petalCount = 6;

  const petalGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.2, 0.5, 0.8, 0, 1.2);
    shape.bezierCurveTo(-0.5, 0.8, -0.3, 0.2, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;
  });

  const petalColor = useMemo(() => new THREE.Color(color), [color]);
  const centerColor = useMemo(() => new THREE.Color('#FFD700'), []);
  const stemColor  = useMemo(() => new THREE.Color('#4CAF8A'), []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Petals */}
      {Array.from({ length: petalCount }).map((_, i) => (
        <mesh
          key={i}
          geometry={petalGeo}
          rotation={[0.2, 0, (i * Math.PI * 2) / petalCount]}
          position={[0, 0.2, 0]}
        >
          <meshStandardMaterial
            color={petalColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
      {/* Center */}
      <mesh position={[0, 0.2, 0.05]}>
        <circleGeometry args={[0.25, 16]} />
        <meshStandardMaterial color={centerColor} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 1.0, 8]} />
        <meshStandardMaterial color={stemColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Particle Petal Cloud ────────────────────────────────────────────────────
function PetalDust() {
  const ref = useRef<THREE.Points>(null!);
  const count = 300;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  const speeds = useMemo(() => Array.from({ length: count }, () => Math.random() * 0.4 + 0.1), []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i] * 0.008;
      pos[i * 3]     += Math.sin(state.clock.elapsedTime * speeds[i] + i) * 0.003;
      if (pos[i * 3 + 1] < -8) pos[i * 3 + 1] = 8;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FFB3C6"
        size={0.08}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// ─── Mouse-reactive Camera ───────────────────────────────────────────────────
function CameraRig() {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    gl.domElement.addEventListener('mousemove', handler);
    return () => gl.domElement.removeEventListener('mousemove', handler);
  }, [gl]);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Flower Field Scene ──────────────────────────────────────────────────────
const FLOWERS = [
  { position: [-4, -1.5, -2] as [number, number, number], color: '#FF85A1', scale: 0.8, speed: 0.8 },
  { position: [-2, -2,   0]  as [number, number, number], color: '#C8B6E2', scale: 1.0, speed: 0.6 },
  { position: [0,  -1.8, -1] as [number, number, number], color: '#FFB3C6', scale: 1.2, speed: 0.9 },
  { position: [2,  -2,   0]  as [number, number, number], color: '#DDA0DD', scale: 0.9, speed: 0.7 },
  { position: [4,  -1.5, -2] as [number, number, number], color: '#FF4D6D', scale: 0.85, speed: 1.0 },
  { position: [-3, -2.2, 1]  as [number, number, number], color: '#FFD700', scale: 0.7, speed: 0.5 },
  { position: [3,  -2.2, 1]  as [number, number, number], color: '#B5EAD7', scale: 0.75, speed: 0.6 },
  { position: [-1, -2.5, 2]  as [number, number, number], color: '#FF6B9D', scale: 0.6, speed: 1.1 },
  { position: [1,  -2.5, 2]  as [number, number, number], color: '#E8B4E8', scale: 0.65, speed: 0.8 },
];

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fff5f8" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#C8B6E2" />
      <pointLight position={[5, -5, -5]} intensity={0.4} color="#FF85A1" />

      {FLOWERS.map((f, i) => (
        <Flower key={i} {...f} />
      ))}
      <PetalDust />
      <CameraRig />
    </>
  );
}

export function FlowerField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
