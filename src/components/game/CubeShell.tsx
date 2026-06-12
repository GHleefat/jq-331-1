import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CUBE_SIZE } from '../../utils/constants';

interface CubeShellProps {
  won: boolean;
}

export function CubeShell({ won }: CubeShellProps) {
  const edgesRef = useRef<THREE.LineSegments>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (edgesRef.current) {
      const material = edgesRef.current.material as THREE.LineBasicMaterial;
      material.color.setHex(
        won ? 0x2ed573 : parseInt(COLORS.accent.replace('#', ''), 16)
      );
      material.opacity = won
        ? 0.8 + Math.sin(time * 5) * 0.2
        : 0.6 + Math.sin(time * 2) * 0.2;
    }

    if (glassRef.current) {
      const material = glassRef.current.material as THREE.MeshPhysicalMaterial;
      material.emissiveIntensity = won
        ? 0.5 + Math.sin(time * 4) * 0.3
        : 0.1 + Math.sin(time * 1.5) * 0.05;
    }
  });

  const halfSize = CUBE_SIZE / 2;

  return (
    <group>
      <mesh ref={glassRef}>
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshPhysicalMaterial
          color={COLORS.accent}
          transparent
          opacity={0.05}
          roughness={0}
          metalness={0.1}
          transmission={0.9}
          thickness={0.1}
          emissive={COLORS.accent}
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments ref={edgesRef}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)]}
        />
        <lineBasicMaterial
          color={COLORS.accent}
          transparent
          opacity={0.6}
          linewidth={2}
        />
      </lineSegments>

      <mesh position={[0, -halfSize, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[halfSize * 0.3, halfSize * 0.35, 64]} />
        <meshBasicMaterial
          color={COLORS.accent}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
