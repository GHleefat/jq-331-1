import { useState, useCallback, useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import type { GameStatus } from '../utils/types';
import { INITIAL_ROTATION } from '../utils/constants';

export interface GameStateData {
  status: GameStatus;
  elapsedTime: number;
  collisionCount: number;
  pitFallCount: number;
  cubeRotation: { x: number; y: number };
  targetRotation: { x: number; y: number };
}

export function useGameState(startPos: [number, number, number]) {
  const [state, setState] = useState<GameStateData>({
    status: 'idle',
    elapsedTime: 0,
    collisionCount: 0,
    pitFallCount: 0,
    cubeRotation: { ...INITIAL_ROTATION },
    targetRotation: { ...INITIAL_ROTATION },
  });

  const ballPosition = useRef(
    new Vector3(startPos[0], startPos[1], startPos[2])
  );
  const ballVelocity = useRef(new Vector3(0, 0, 0));
  const gravityDirection = useRef(new Vector3(0, -1, 0));

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'playing',
      elapsedTime: 0,
      collisionCount: 0,
      pitFallCount: 0,
    }));
    startTimeRef.current = performance.now();
  }, []);

  const winGame = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'won' }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const incrementCollision = useCallback(() => {
    setState((prev) => ({
      ...prev,
      collisionCount: prev.collisionCount + 1,
    }));
  }, []);

  const incrementPitFall = useCallback(() => {
    setState((prev) => ({
      ...prev,
      pitFallCount: prev.pitFallCount + 1,
    }));
  }, []);

  const updateElapsedTime = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setState((prev) => ({ ...prev, elapsedTime: elapsed }));
    }
  }, []);

  const setTargetRotation = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      targetRotation: { x, y },
    }));
  }, []);

  const setActualRotation = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      cubeRotation: { x, y },
    }));
  }, []);

  const resetGame = useCallback(() => {
    ballPosition.current.set(startPos[0], startPos[1], startPos[2]);
    ballVelocity.current.set(0, 0, 0);
    gravityDirection.current.set(0, -1, 0);
    startTimeRef.current = null;
    setState({
      status: 'idle',
      elapsedTime: 0,
      collisionCount: 0,
      pitFallCount: 0,
      cubeRotation: { ...INITIAL_ROTATION },
      targetRotation: { ...INITIAL_ROTATION },
    });
  }, [startPos]);

  const updateGravityFromRotation = useCallback((rotX: number, rotY: number) => {
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const gx = -sinY;
    const gy = -sinX * cosY;
    const gz = -cosX * cosY;

    gravityDirection.current.set(gx, gy, gz).normalize();
  }, []);

  useEffect(() => {
    const frameRef = animationFrameRef;
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    state,
    startGame,
    winGame,
    incrementCollision,
    incrementPitFall,
    updateElapsedTime,
    setTargetRotation,
    setActualRotation,
    resetGame,
    updateGravityFromRotation,
  };
}
