import { useRef, useCallback, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EffectComposer, Bloom, FXAA } from '@react-three/postprocessing';
import { Walls } from './Walls';
import { Pits } from './Pits';
import { Goal } from './Goal';
import { Ball } from './Ball';
import { CubeShell } from './CubeShell';
import { usePhysics } from '../../hooks/usePhysics';
import { useDragRotation } from '../../hooks/useDragRotation';
import { generateMaze } from '../../utils/mazeGenerator';
import { PHYSICS_TIMESTEP, INITIAL_ROTATION } from '../../utils/constants';
import type { GameStateData } from '../../hooks/useGameState';

interface MazeCubeProps {
  gameState: GameStateData;
  onCollision: () => void;
  onPitFall: () => void;
  onWin: () => void;
  onRotationUpdate: (x: number, y: number) => void;
  onGravityUpdate: (x: number, y: number) => void;
  resetTrigger: number;
}

export function MazeCube({
  gameState,
  onCollision,
  onPitFall,
  onWin,
  onRotationUpdate,
  onGravityUpdate,
  resetTrigger,
}: MazeCubeProps) {
  const mazeData = useRef(generateMaze());
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [mazeKey, setMazeKey] = useState(0);

  const { position: ballPosRef, velocity: ballVelRef, update: updatePhysics, reset: resetPhysics } =
    usePhysics(
      mazeData.current.walls,
      mazeData.current.pits,
      mazeData.current.goal,
      mazeData.current.start
    );

  const handleRotationChange = useCallback(
    (x: number, y: number) => {
      onRotationUpdate(x, y);
      onGravityUpdate(x, y);
    },
    [onRotationUpdate, onGravityUpdate]
  );

  const { update: updateRotation } = useDragRotation({
    onRotationChange: handleRotationChange,
    initialRotation: INITIAL_ROTATION,
  });

  const accumulatorRef = useRef(0);

  useEffect(() => {
    setMazeKey((prev) => prev + 1);
    resetPhysics();
  }, [resetTrigger, resetPhysics]);

  useFrame((_, delta) => {
    if (gameState.status === 'won') {
      if (groupRef.current) {
        groupRef.current.rotation.x = gameState.cubeRotation.x;
        groupRef.current.rotation.y = gameState.cubeRotation.y;
      }
      return;
    }

    const actualRot = updateRotation();

    if (groupRef.current) {
      groupRef.current.rotation.x = actualRot.x;
      groupRef.current.rotation.y = actualRot.y;
    }

    if (gameState.status === 'playing') {
      accumulatorRef.current += delta;

      while (accumulatorRef.current >= PHYSICS_TIMESTEP) {
        const gravity = new THREE.Vector3(0, -1, 0);
        gravity.applyQuaternion(groupRef.current!.quaternion);

        const result = updatePhysics(gravity, PHYSICS_TIMESTEP);

        if (result.hitWall) {
          onCollision();
        }
        if (result.fellInPit) {
          onPitFall();
        }
        if (result.reachedGoal) {
          onWin();
          break;
        }

        accumulatorRef.current -= PHYSICS_TIMESTEP;
      }
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableRotate={false}
        minDistance={8}
        maxDistance={15}
        enableDamping
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.4} color="#4a9eff" />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00f5ff" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#ff4757" />

      <group ref={groupRef}>
        <CubeShell won={gameState.status === 'won'} />
        <Walls key={`walls-${mazeKey}`} walls={mazeData.current.walls} />
        <Pits key={`pits-${mazeKey}`} pits={mazeData.current.pits} />
        <Goal
          key={`goal-${mazeKey}`}
          position={mazeData.current.goal}
          won={gameState.status === 'won'}
        />
        <Ball
          positionRef={ballPosRef}
          velocityRef={ballVelRef}
          won={gameState.status === 'won'}
        />
      </group>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
        <FXAA />
      </EffectComposer>

      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          key={`star-${i}`}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
          ]}
        >
          <sphereGeometry args={[Math.random() * 0.05 + 0.02, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={Math.random() * 0.5 + 0.2} />
        </mesh>
      ))}
    </>
  );
}
