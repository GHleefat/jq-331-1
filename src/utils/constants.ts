export const MAZE_SIZE = 5;
export const CELL_SIZE = 1;
export const WALL_THICKNESS = 0.15;
export const BALL_RADIUS = 0.18;

export const GRAVITY_STRENGTH = 18;
export const FRICTION = 0.94;
export const BOUNCE_DAMPING = 0.25;
export const MAX_SPEED = 8;

export const ROTATION_SPEED = 0.005;
export const ROTATION_EASING = 0.15;

export const CUBE_SIZE = MAZE_SIZE * CELL_SIZE;
export const CUBE_HALF = CUBE_SIZE / 2;

export const COLORS = {
  background: '#0a1628',
  accent: '#00f5ff',
  wall: '#c0c0c0',
  pit: '#ff4757',
  goal: '#2ed573',
  ball: '#ffd700',
  cubeGlass: 'rgba(0, 245, 255, 0.08)',
  cubeEdge: '#00f5ff',
};

export const INITIAL_ROTATION = { x: 0.4, y: 0.6 };

export const PHYSICS_TIMESTEP = 1 / 60;
