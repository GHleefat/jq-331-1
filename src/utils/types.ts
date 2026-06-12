import type { Vector3 } from 'three';

export type CellType = 'empty' | 'wall' | 'pit' | 'goal' | 'start';

export interface MazeCell {
  x: number;
  y: number;
  z: number;
  type: CellType;
}

export interface BallPhysics {
  position: Vector3;
  velocity: Vector3;
  radius: number;
}

export type GameStatus = 'idle' | 'playing' | 'won';

export interface GameState {
  status: GameStatus;
  elapsedTime: number;
  collisionCount: number;
  ballPosition: Vector3;
  ballVelocity: Vector3;
  cubeRotation: { x: number; y: number };
  gravityDirection: Vector3;
}

export interface WallData {
  position: [number, number, number];
  size: [number, number, number];
}

export interface PitData {
  position: [number, number, number];
}

export interface MazeData {
  walls: WallData[];
  pits: PitData[];
  goal: [number, number, number];
  start: [number, number, number];
}

export interface PhysicsResult {
  hitWall: boolean;
  fellInPit: boolean;
  reachedGoal: boolean;
  newPosition: Vector3;
  newVelocity: Vector3;
}
