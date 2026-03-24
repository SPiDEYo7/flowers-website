'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { FlowerType, ColorTheme } from '@/lib/utils';
import { COLOR_THEMES } from '@/lib/utils';

const FLOWER_COLORS: Record<string, string> = {
  rose:      '#FF4D6D',
  lily:      '#FFB3C6',
  tulip:     '#FF85A1',
  sunflower: '#FFD700',
  cherry:    '#FF6B9D',
  lavender:  '#C8B6E2',
  daisy:     '#FFFDE7',
  orchid:    '#DDA0DD',
};

// ─── Use leaf geometry via THREE.ShapeGeometry ─────────────────────────────────
function useLeafGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo( 0.12,  0.04,  0.18, 0.10,  0.15, 0.15);
    shape.bezierCurveTo( 0.12,  0.20,  0.04, 0.22,  0,    0.20);
    shape.bezierCurveTo(-0.04,  0.22, -0.12, 0.20, -0.15, 0.15);
    shape.bezierCurveTo(-0.18,  0.10, -0.12, 0.04,  0,    0);
    return new THREE.ShapeGeometry(shape, 6);
  }, []);
}

// ─── Single Petal ──────────────────────────────────────────────────────────────
function FlowerPetal({
  angle, color, themeColor,
}: {
  angle: number; color: THREE.Color; themeColor: THREE.Color;
}) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.1, 0.3, 0.5, 0, 0.7);
    shape.bezierCurveTo(-0.3, 0.5, -0.2, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 12);
  }, []);

  // Blend flower's natural color with theme color (70% natural, 30% theme)
  const blended = useMemo(() => {
    const c = color.clone();
    c.lerp(themeColor, 0.25);
    return c;
  }, [color, themeColor]);

  return (
    <mesh geometry={geo} rotation={[0.3, 0, angle]}>
      <meshStandardMaterial
        color={blended}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        roughness={0.3}
        metalness={0.05}
        emissive={blended}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// ─── Individual 3D flower ──────────────────────────────────────────────────────
function Flower3D({
  position, flowerType, index, themeColor,
}: {
  position: [number, number, number];
  flowerType: FlowerType;
  index: number;
  themeColor: THREE.Color;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const hexColor  = FLOWER_COLORS[flowerType] || '#FF85A1';
  const color     = useMemo(() => new THREE.Color(hexColor), [hexColor]);
  const center    = useMemo(() => new THREE.Color('#FFD700'), []);
  const stemColor = useMemo(() => new THREE.Color('#4CAF8A'), []);
  const petalN    = flowerType === 'sunflower' ? 14 : 6;
  const leafGeo   = useLeafGeometry();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + index * 0.8;
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.1;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.06;
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <group>
          {Array.from({ length: petalN }).map((_, i) => (
            <FlowerPetal
              key={i}
              angle={(i * Math.PI * 2) / petalN}
              color={color}
              themeColor={themeColor}
            />
          ))}
          {/* Centre stamen */}
          <mesh>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial
              color={center}
              roughness={0.2}
              metalness={0.3}
              emissive={center}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      </Float>

      {/* Stem */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.8, 8]} />
        <meshStandardMaterial color={stemColor} roughness={0.9} />
      </mesh>

      {/* Leaf A */}
      <mesh geometry={leafGeo} position={[0.12, -0.38, 0]} rotation={[0, 0, 0.5]}>
        <meshStandardMaterial color={stemColor} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>

      {/* Leaf B */}
      <mesh geometry={leafGeo} position={[-0.12, -0.52, 0]} rotation={[0, 0, -0.6]}>
        <meshStandardMaterial color={stemColor} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

const BOUQUET_POSITIONS: [number, number, number][] = [
  [0,    0,    0],
  [-0.6, -0.1, 0.1],
  [0.6,  -0.1, 0.1],
  [-0.3, -0.5, 0.2],
  [0.3,  -0.5, 0.2],
  [-0.9, -0.3, -0.1],
  [0.9,  -0.3, -0.1],
];

interface Props {
  flowers: { flowerType: FlowerType }[];
  colorTheme?: ColorTheme;
}

function BouquetGroup({ flowers, themeColor }: Props & { themeColor: THREE.Color }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  const displayFlowers =
    flowers.length > 0
      ? flowers.slice(0, 7)
      : [
          { flowerType: 'rose'   as FlowerType },
          { flowerType: 'lily'   as FlowerType },
          { flowerType: 'tulip'  as FlowerType },
        ];

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      {displayFlowers.map((f, i) => (
        <Flower3D
          key={i}
          position={BOUQUET_POSITIONS[i % BOUQUET_POSITIONS.length]}
          flowerType={f.flowerType}
          index={i}
          themeColor={themeColor}
        />
      ))}
      {/* Bouquet wrap cone */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.6, 1.0, 16, 1, true]} />
        <meshStandardMaterial
          color="#FFF8F0"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

// ─── Lights that react to colorTheme ──────────────────────────────────────────
function ThemeLights({ accentHex }: { accentHex: string }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 8, 5]} intensity={1.5} color="#fff5f8" />
      <pointLight position={[-4, 4, 2]} intensity={0.8} color={accentHex} />
      <pointLight position={[4, -2, 2]} intensity={0.5} color={accentHex} />
    </>
  );
}

export function BouquetScene({ flowers = [], colorTheme = 'pink' }: Props) {
  const themeData  = COLOR_THEMES.find((t) => t.id === colorTheme);
  const accentHex  = themeData?.colors[1] || '#FF85A1';
  const themeColor = useMemo(() => new THREE.Color(accentHex), [accentHex]);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ThemeLights accentHex={accentHex} />
      <BouquetGroup flowers={flowers} themeColor={themeColor} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />

      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.5} luminanceSmoothing={0.8} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
