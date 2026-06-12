import { useRef, useCallback } from "react";
import { Vector3 } from "three";
import {
  GRAVITY_STRENGTH,
  FRICTION,
  BOUNCE_DAMPING,
  MAX_SPEED,
  BALL_RADIUS,
  WALL_THICKNESS,
  MAZE_SIZE,
  CELL_SIZE,
} from "../utils/constants";
import type { WallData, PitData, PhysicsResult } from "../utils/types";

function clampSpeed(v: Vector3, max: number): void {
  const speed = v.length();
  if (speed > max) {
    v.normalize().multiplyScalar(max);
  }
}

function resolveWallCollision(
  pos: Vector3,
  vel: Vector3,
  wallPos: [number, number, number],
  wallSize: [number, number, number],
): boolean {
  const halfW = wallSize[0] / 2 + BALL_RADIUS;
  const halfH = wallSize[1] / 2 + BALL_RADIUS;
  const halfD = wallSize[2] / 2 + BALL_RADIUS;

  const dx = pos.x - wallPos[0];
  const dy = pos.y - wallPos[1];
  const dz = pos.z - wallPos[2];

  if (Math.abs(dx) < halfW && Math.abs(dy) < halfH && Math.abs(dz) < halfD) {
    const overlapX = halfW - Math.abs(dx);
    const overlapY = halfH - Math.abs(dy);
    const overlapZ = halfD - Math.abs(dz);

    const minOverlap = Math.min(overlapX, overlapY, overlapZ);

    if (minOverlap === overlapX) {
      pos.x = wallPos[0] + (dx > 0 ? halfW : -halfW);
      vel.x = -vel.x * BOUNCE_DAMPING;
    } else if (minOverlap === overlapY) {
      pos.y = wallPos[1] + (dy > 0 ? halfH : -halfH);
      vel.y = -vel.y * BOUNCE_DAMPING;
    } else {
      pos.z = wallPos[2] + (dz > 0 ? halfD : -halfD);
      vel.z = -vel.z * BOUNCE_DAMPING;
    }

    return true;
  }

  return false;
}

function checkPitCollision(
  pos: Vector3,
  pitPos: [number, number, number],
): boolean {
  const pitRadius = CELL_SIZE * 0.4;
  const dx = pos.x - pitPos[0];
  const dy = pos.y - pitPos[1];
  const dz = pos.z - pitPos[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < pitRadius;
}

function checkGoalCollision(
  pos: Vector3,
  goalPos: [number, number, number],
): boolean {
  const goalRadius = CELL_SIZE * 0.45;
  const dx = pos.x - goalPos[0];
  const dy = pos.y - goalPos[1];
  const dz = pos.z - goalPos[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < goalRadius;
}

export function usePhysics(
  walls: WallData[],
  pits: PitData[],
  goal: [number, number, number],
  startPos: [number, number, number],
) {
  const positionRef = useRef(
    new Vector3(startPos[0], startPos[1], startPos[2]),
  );
  const velocityRef = useRef(new Vector3(0, 0, 0));

  const update = useCallback(
    (gravityDir: Vector3, dt: number): PhysicsResult => {
      const pos = positionRef.current;
      const vel = velocityRef.current;

      const gravity = gravityDir
        .clone()
        .normalize()
        .multiplyScalar(GRAVITY_STRENGTH * dt);
      vel.add(gravity);

      vel.multiplyScalar(FRICTION);

      clampSpeed(vel, MAX_SPEED);

      const deltaPos = vel.clone().multiplyScalar(dt);
      pos.add(deltaPos);

      let hitWall = false;
      walls.forEach((wall) => {
        if (resolveWallCollision(pos, vel, wall.position, wall.size)) {
          hitWall = true;
        }
      });

      const bound = (MAZE_SIZE * CELL_SIZE) / 2 - WALL_THICKNESS - BALL_RADIUS;
      if (pos.x < -bound) {
        pos.x = -bound;
        vel.x = -vel.x * BOUNCE_DAMPING;
        hitWall = true;
      }
      if (pos.x > bound) {
        pos.x = bound;
        vel.x = -vel.x * BOUNCE_DAMPING;
        hitWall = true;
      }
      if (pos.y < -bound) {
        pos.y = -bound;
        vel.y = -vel.y * BOUNCE_DAMPING;
        hitWall = true;
      }
      if (pos.y > bound) {
        pos.y = bound;
        vel.y = -vel.y * BOUNCE_DAMPING;
        hitWall = true;
      }
      if (pos.z < -bound) {
        pos.z = -bound;
        vel.z = -vel.z * BOUNCE_DAMPING;
        hitWall = true;
      }
      if (pos.z > bound) {
        pos.z = bound;
        vel.z = -vel.z * BOUNCE_DAMPING;
        hitWall = true;
      }

      let fellInPit = false;
      for (const pit of pits) {
        if (checkPitCollision(pos, pit.position)) {
          fellInPit = true;
          break;
        }
      }

      if (fellInPit) {
        pos.set(startPos[0], startPos[1], startPos[2]);
        vel.set(0, 0, 0);
      }

      const reachedGoal = checkGoalCollision(pos, goal);

      return {
        hitWall,
        fellInPit,
        reachedGoal,
        newPosition: pos.clone(),
        newVelocity: vel.clone(),
      };
    },
    [walls, pits, goal, startPos],
  );

  const reset = useCallback(
    (newStart?: [number, number, number]) => {
      const pos = newStart || startPos;
      positionRef.current.set(pos[0], pos[1], pos[2]);
      velocityRef.current.set(0, 0, 0);
    },
    [startPos],
  );

  return {
    position: positionRef,
    velocity: velocityRef,
    update,
    reset,
  };
}
