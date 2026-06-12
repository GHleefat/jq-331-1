import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, BALL_RADIUS } from '../../utils/constants';
import type { MutableRefObject } from 'react';

interface BallProps {
  positionRef: MutableRefObject<THREE.Vector3>;
  velocityRef: MutableRefObject<THREE.Vector3>;
  won: boolean;
}

export function Ball({ positionRef, velocityRef, won }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const trailRef = useRef<THREE.Points>(null);

  const trailLength = 20;
  const trailPositions = useMemo(
    () => new Float32Array(trailLength * 3),
    []
  );
  const trailColors = useMemo(
    () => new Float32Array(trailLength * 3),
    []
  );

  useFrame((state, delta) => {
    const pos = positionRef.current;
    const vel = velocityRef.current;

    if (meshRef.current) {
      meshRef.current.position.copy(pos);

      const speed = vel.length();
      const rotationAxis = new THREE.Vector3()
        .crossVectors(vel, new THREE.Vector3(0, 1, 0))
        .normalize();
      if (speed > 0.01 && rotationAxis.length() > 0.01) {
        const rotationAngle = (speed * delta) / BALL_RADIUS;
        meshRef.current.rotateOnWorldAxis(rotationAxis, rotationAngle);
      }
    }

    if (glowRef.current) {
      glowRef.current.position.copy(pos);
      const pulse = won
        ? 1.2 + Math.sin(state.clock.elapsedTime * 10) * 0.3
        : 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(pulse);
    }

    if (lightRef.current) {
      lightRef.current.position.copy(pos);
      lightRef.current.intensity = won
        ? 3 + Math.sin(state.clock.elapsedTime * 8) * 1.5
        : 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }

    if (trailRef.current) {
      for (let i = trailLength - 1; i > 0; i--) {
        trailPositions[i * 3] = trailPositions[(i - 1) * 3];
        trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
        trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
      }
      trailPositions[0] = pos.x;
      trailPositions[1] = pos.y;
      trailPositions[2] = pos.z;

      const color = new THREE.Color(COLORS.ball);
      for (let i = 0; i < trailLength; i++) {
        const alpha = 1 - i / trailLength;
        trailColors[i * 3] = color.r * alpha;
        trailColors[i * 3 + 1] = color.g * alpha;
        trailColors[i * 3 + 2] = color.b * alpha;
      }

      trailRef.current.geometry.attributes.position.needsUpdate = true;
      trailRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.ball}
          emissive={COLORS.ball}
          emissiveIntensity={won ? 0.8 : 0.3}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[BALL_RADIUS * 1.5, 16, 16]} />
        <meshBasicMaterial
          color={COLORS.ball}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={COLORS.ball}
        intensity={1.5}
        distance={3}
        decay={2}
      />

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trailLength}
            array={trailPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={trailLength}
            array={trailColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={BALL_RADIUS * 0.5}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
