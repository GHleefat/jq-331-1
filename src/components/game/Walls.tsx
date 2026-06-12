import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WallData } from '../../utils/types';
import { COLORS } from '../../utils/constants';

interface WallsProps {
  walls: WallData[];
}

export function Walls({ walls }: WallsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    walls.forEach((wall, i) => {
      dummy.position.set(wall.position[0], wall.position[1], wall.position[2]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, walls.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={COLORS.wall}
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1}
      />
    </instancedMesh>
  );
}
