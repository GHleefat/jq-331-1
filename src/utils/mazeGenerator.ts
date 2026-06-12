import {
  MAZE_SIZE,
  CELL_SIZE,
  CUBE_HALF,
  WALL_THICKNESS,
} from './constants';
import type { MazeData, WallData, PitData } from './types';

function gridToWorld(gx: number, gy: number, gz: number): [number, number, number] {
  return [
    (gx - MAZE_SIZE / 2 + 0.5) * CELL_SIZE,
    (gy - MAZE_SIZE / 2 + 0.5) * CELL_SIZE,
    (gz - MAZE_SIZE / 2 + 0.5) * CELL_SIZE,
  ];
}

function createOuterWalls(): WallData[] {
  const walls: WallData[] = [];
  const half = CUBE_HALF;
  const t = WALL_THICKNESS;
  const s = MAZE_SIZE * CELL_SIZE;

  walls.push({ position: [0, 0, -half], size: [s, s, t] });
  walls.push({ position: [0, 0, half], size: [s, s, t] });
  walls.push({ position: [-half, 0, 0], size: [t, s, s] });
  walls.push({ position: [half, 0, 0], size: [t, s, s] });
  walls.push({ position: [0, -half, 0], size: [s, t, s] });
  walls.push({ position: [0, half, 0], size: [s, t, s] });

  return walls;
}

function createInnerWalls(): WallData[] {
  const walls: WallData[] = [];
  const t = WALL_THICKNESS;
  const s = CELL_SIZE;

  const wallPatterns: [number, number, number, 'x' | 'y' | 'z'][] = [
    [1, 1, 1, 'x'],
    [1, 1, 2, 'y'],
    [2, 1, 1, 'z'],
    [3, 2, 1, 'x'],
    [1, 2, 3, 'y'],
    [2, 3, 2, 'z'],
    [3, 1, 3, 'x'],
    [1, 3, 1, 'y'],
    [3, 3, 2, 'z'],
    [2, 1, 4, 'x'],
    [4, 2, 2, 'y'],
    [2, 4, 3, 'z'],
    [1, 1, 4, 'x'],
    [4, 3, 1, 'y'],
    [1, 4, 4, 'z'],
    [3, 1, 2, 'x'],
    [2, 2, 4, 'y'],
    [4, 1, 4, 'z'],
  ];

  wallPatterns.forEach(([gx, gy, gz, axis]) => {
    const [wx, wy, wz] = gridToWorld(gx, gy, gz);
    let size: [number, number, number];
    if (axis === 'x') {
      size = [s + t * 2, t, t];
    } else if (axis === 'y') {
      size = [t, s + t * 2, t];
    } else {
      size = [t, t, s + t * 2];
    }
    walls.push({ position: [wx, wy, wz], size });
  });

  return walls;
}

function createPits(): PitData[] {
  const pitPositions: [number, number, number][] = [
    [2, 2, 2],
    [1, 3, 2],
    [3, 1, 3],
    [2, 4, 1],
    [4, 2, 3],
    [1, 1, 3],
    [3, 3, 4],
  ];

  return pitPositions.map(([gx, gy, gz]) => ({
    position: gridToWorld(gx, gy, gz),
  }));
}

export function generateMaze(): MazeData {
  const outerWalls = createOuterWalls();
  const innerWalls = createInnerWalls();
  const pits = createPits();

  return {
    walls: [...outerWalls, ...innerWalls],
    pits,
    goal: gridToWorld(4, 4, 4),
    start: gridToWorld(0, 0, 0),
  };
}
