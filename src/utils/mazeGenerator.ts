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

type CellGrid = boolean[][][];

function createEmptyGrid(): CellGrid {
  const grid: CellGrid = [];
  for (let x = 0; x < MAZE_SIZE; x++) {
    grid[x] = [];
    for (let y = 0; y < MAZE_SIZE; y++) {
      grid[x][y] = [];
      for (let z = 0; z < MAZE_SIZE; z++) {
        grid[x][y][z] = false;
      }
    }
  }
  return grid;
}

function createInnerWallsFromGrid(wallGrid: CellGrid): WallData[] {
  const walls: WallData[] = [];
  const wallSize = CELL_SIZE * 0.92;

  for (let x = 0; x < MAZE_SIZE; x++) {
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let z = 0; z < MAZE_SIZE; z++) {
        if (wallGrid[x][y][z]) {
          const [wx, wy, wz] = gridToWorld(x, y, z);
          walls.push({
            position: [wx, wy, wz],
            size: [wallSize, wallSize, wallSize],
          });
        }
      }
    }
  }

  return walls;
}

function createPitsFromGrid(pitGrid: CellGrid): PitData[] {
  const pits: PitData[] = [];

  for (let x = 0; x < MAZE_SIZE; x++) {
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let z = 0; z < MAZE_SIZE; z++) {
        if (pitGrid[x][y][z]) {
          pits.push({
            position: gridToWorld(x, y, z),
          });
        }
      }
    }
  }

  return pits;
}

function generateMazeLayout(): {
  wallGrid: CellGrid;
  pitGrid: CellGrid;
  start: [number, number, number];
  goal: [number, number, number];
} {
  const wallGrid = createEmptyGrid();
  const pitGrid = createEmptyGrid();
  const start: [number, number, number] = [0, 0, 0];
  const goal: [number, number, number] = [MAZE_SIZE - 1, MAZE_SIZE - 1, MAZE_SIZE - 1];

  const wallPatterns: [number, number, number][] = [
    [2, 0, 0], [2, 0, 1], [2, 0, 2],
    [0, 2, 0], [1, 2, 0], [2, 2, 0],
    [0, 0, 2], [0, 1, 2], [0, 2, 2], [0, 3, 2],
    [4, 2, 0], [4, 2, 1], [4, 2, 2], [4, 2, 3],
    [2, 4, 0], [2, 4, 1], [2, 4, 2], [3, 4, 2],
    [2, 2, 4], [1, 2, 4], [2, 1, 4], [3, 2, 4],
    [4, 0, 2], [4, 1, 2],
    [0, 4, 2], [1, 4, 2],
    [2, 0, 4], [2, 1, 4],
    [1, 1, 1], [3, 1, 1], [1, 3, 1], [1, 1, 3],
    [3, 3, 1], [3, 1, 3], [1, 3, 3], [3, 3, 3],
    [2, 2, 2],
  ];

  wallPatterns.forEach(([x, y, z]) => {
    const isStart = x === start[0] && y === start[1] && z === start[2];
    const isGoal = x === goal[0] && y === goal[1] && z === goal[2];
    if (!isStart && !isGoal) {
      wallGrid[x][y][z] = true;
    }
  });

  const pitPatterns: [number, number, number][] = [
    [1, 0, 1], [3, 0, 3],
    [0, 1, 1], [4, 1, 4],
    [1, 1, 0], [3, 3, 0], [0, 3, 3], [4, 3, 1],
    [1, 4, 4], [3, 4, 0],
    [0, 0, 4], [4, 4, 0],
    [2, 3, 4], [4, 2, 4], [4, 4, 2],
  ];

  pitPatterns.forEach(([x, y, z]) => {
    const isStart = x === start[0] && y === start[1] && z === start[2];
    const isGoal = x === goal[0] && y === goal[1] && z === goal[2];
    const isWall = wallGrid[x][y][z];
    if (!isStart && !isGoal && !isWall) {
      pitGrid[x][y][z] = true;
    }
  });

  return { wallGrid, pitGrid, start, goal };
}

export function generateMaze(): MazeData {
  const { wallGrid, pitGrid, start, goal } = generateMazeLayout();

  const outerWalls = createOuterWalls();
  const innerWalls = createInnerWallsFromGrid(wallGrid);
  const pits = createPitsFromGrid(pitGrid);

  return {
    walls: [...outerWalls, ...innerWalls],
    pits,
    goal: gridToWorld(goal[0], goal[1], goal[2]),
    start: gridToWorld(start[0], start[1], start[2]),
  };
}
