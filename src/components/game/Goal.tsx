import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CELL_SIZE } from '../../utils/constants';

interface GoalProps {
  position: [number, number, number];
  won: boolean;
}

export function Goal({ position, won }: GoalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.8;
      meshRef.current.rotation.x = time * 0.4;
      const pulse = won ? 1 + Math.sin(time * 8) * 0.2 : 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }

    if (glowRef.current) {
      const scale = won ? 1.5 + Math.sin(time * 6) * 0.3 : 1 + Math.sin(time * 3) * 0.15;
      glowRef.current.scale.setScalar(scale);
      glowRef.current.rotation.z = time * 0.5;
    }

    if (lightRef.current) {
      lightRef.current.intensity = won
        ? 2 + Math.sin(time * 10) * 1
        : 0.8 + Math.sin(time * 3) * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[CELL_SIZE * 0.35, 0]} />
        <meshStandardMaterial
          color={COLORS.goal}
          emissive={COLORS.goal}
          emissiveIntensity={won ? 2 : 0.8}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={glowRef}>
        <torusGeometry args={[CELL_SIZE * 0.5, CELL_SIZE * 0.05, 16, 48]} />
        <meshBasicMaterial
          color={COLORS.goal}
          transparent
          opacity={won ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={COLORS.goal}
        intensity={1}
        distance={4}
        decay={2}
      />
    </group>
  );
}
