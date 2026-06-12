import { useRef, useCallback, useEffect } from "react";
import { ROTATION_SPEED, ROTATION_EASING } from "../utils/constants";

interface UseDragRotationOptions {
  onRotationChange: (x: number, y: number) => void;
  initialRotation?: { x: number; y: number };
}

export function useDragRotation({
  onRotationChange,
  initialRotation = { x: 0, y: 0 },
}: UseDragRotationOptions) {
  const targetRotationRef = useRef({ ...initialRotation });
  const actualRotationRef = useRef({ ...initialRotation });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

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

    targetRotationRef.current = {
      x: targetRotationRef.current.x - dy * ROTATION_SPEED,
      y: targetRotationRef.current.y - dx * ROTATION_SPEED,
    };

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const update = useCallback(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    actualRotationRef.current = {
      x: lerp(
        actualRotationRef.current.x,
        targetRotationRef.current.x,
        ROTATION_EASING,
      ),
      y: lerp(
        actualRotationRef.current.y,
        targetRotationRef.current.y,
        ROTATION_EASING,
      ),
    };

    onRotationChange(actualRotationRef.current.x, actualRotationRef.current.y);

    return actualRotationRef.current;
  }, [onRotationChange]);

  const reset = useCallback(() => {
    targetRotationRef.current = { ...initialRotation };
    actualRotationRef.current = { ...initialRotation };
    onRotationChange(initialRotation.x, initialRotation.y);
  }, [initialRotation, onRotationChange]);

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    update,
    reset,
    isDragging: isDraggingRef,
    targetRotation: targetRotationRef,
    actualRotation: actualRotationRef,
  };
}
