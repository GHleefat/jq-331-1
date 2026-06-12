import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PitData } from '../../utils/types';
import { COLORS, CELL_SIZE } from '../../utils/constants';

interface PitsProps {
  pits: PitData[];
}

export function Pits({ pits }: PitsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      pits.forEach((pit, i) => {
        dummy.position.set(pit.position[0], pit.position[1], pit.position[2]);
        dummy.rotation.y = time * 0.5 + i;
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      pits.forEach((pit, i) => {
        dummy.position.set(pit.position[0], pit.position[1], pit.position[2]);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        glowRef.current!.setMatrixAt(i, dummy.matrix);
      });
      glowRef.current.instanceMatrix.needsUpdate = true;
    }

    if (lightRef.current && pits.length > 0) {
      const idx = Math.floor((time * 2) % pits.length);
      const pit = pits[idx];
      lightRef.current.position.set(
        pit.position[0],
        pit.position[1],
        pit.position[2]
      );
      lightRef.current.intensity = 0.5 + Math.sin(time * 4) * 0.3;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, pits.length]}
      >
        <cylinderGeometry
          args={[CELL_SIZE * 0.35, CELL_SIZE * 0.35, 0.1, 16]}
        />
        <meshStandardMaterial
          color={COLORS.pit}
          emissive={COLORS.pit}
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.5}
        />
      </instancedMesh>

      <instancedMesh
        ref={glowRef}
        args={[undefined, undefined, pits.length]}
      >
        <ringGeometry args={[CELL_SIZE * 0.35, CELL_SIZE * 0.45, 32]} />
        <meshBasicMaterial
          color={COLORS.pit}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <pointLight
        ref={lightRef}
        color={COLORS.pit}
        intensity={0.5}
        distance={3}
        decay={2}
      />
    </group>
  );
}
