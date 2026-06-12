import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { ROTATION_SPEED, ROTATION_EASING, INITIAL_ROTATION } from '../utils/constants';

interface UseDragRotationOptions {
  onRotationChange: (x: number, y: number, quaternion: THREE.Quaternion) => void;
  initialRotation?: { x: number; y: number };
}

export function useDragRotation({
  onRotationChange,
  initialRotation = INITIAL_ROTATION,
}: UseDragRotationOptions) {
  const targetQuatRef = useRef(new THREE.Quaternion());
  const currentQuatRef = useRef(new THREE.Quaternion());
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const initRotation = useCallback(() => {
    const euler = new THREE.Euler(initialRotation.x, initialRotation.y, 0, 'YXZ');
    const quat = new THREE.Quaternion().setFromEuler(euler);
    targetQuatRef.current.copy(quat);
    currentQuatRef.current.copy(quat);
    eulerRef.current.setFromQuaternion(quat, 'YXZ');
  }, [initialRotation]);

  useEffect(() => {
    initRotation();
  }, [initRotation]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    const rotY = dx * ROTATION_SPEED;
    const rotX = dy * ROTATION_SPEED;

    const quatY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -rotY
    );
    const quatX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -rotX
    );

    const deltaQuat = new THREE.Quaternion().multiplyQuaternions(quatY, quatX);
    targetQuatRef.current.premultiply(deltaQuat);
    targetQuatRef.current.normalize();

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const update = useCallback(() => {
    currentQuatRef.current.slerp(targetQuatRef.current, ROTATION_EASING);
    currentQuatRef.current.normalize();

    eulerRef.current.setFromQuaternion(currentQuatRef.current, 'YXZ');

    onRotationChange(
      eulerRef.current.x,
      eulerRef.current.y,
      currentQuatRef.current
    );

    return {
      x: eulerRef.current.x,
      y: eulerRef.current.y,
      quaternion: currentQuatRef.current,
    };
  }, [onRotationChange]);

  const reset = useCallback(() => {
    initRotation();
    onRotationChange(
      eulerRef.current.x,
      eulerRef.current.y,
      currentQuatRef.current
    );
  }, [initRotation, onRotationChange]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    update,
    reset,
    isDragging: isDraggingRef,
    targetQuaternion: targetQuatRef,
    currentQuaternion: currentQuatRef,
  };
}
