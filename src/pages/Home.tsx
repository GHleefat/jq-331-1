import { useCallback, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MazeCube } from '../components/game/MazeCube';
import { StatusPanel } from '../components/ui/StatusPanel';
import { ControlButtons } from '../components/ui/ControlButtons';
import { VictoryModal } from '../components/ui/VictoryModal';
import { useGameState } from '../hooks/useGameState';
import { generateMaze } from '../utils/mazeGenerator';
import { COLORS } from '../utils/constants';

export default function Home() {
  const mazeData = useRef(generateMaze());
  const [resetTrigger, setResetTrigger] = useState(0);

  const {
    state,
    startGame,
    winGame,
    incrementCollision,
    incrementPitFall,
    updateElapsedTime,
    setActualRotation,
    resetGame,
    updateGravityFromRotation,
  } = useGameState(mazeData.current.start);

  const hasStartedRef = useRef(false);

  const handleFirstInteraction = useCallback(() => {
    if (!hasStartedRef.current && state.status === 'idle') {
      hasStartedRef.current = true;
      startGame();
    }
  }, [state.status, startGame]);

  useEffect(() => {
    if (state.status === 'playing') {
      const interval = setInterval(() => {
        updateElapsedTime();
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state.status, updateElapsedTime]);

  const handleRotationUpdate = useCallback(
    (x: number, y: number) => {
      handleFirstInteraction();
      setActualRotation(x, y);
    },
    [handleFirstInteraction, setActualRotation]
  );

  const handleRestart = useCallback(() => {
    hasStartedRef.current = false;
    mazeData.current = generateMaze();
    setResetTrigger((prev) => prev + 1);
    resetGame();
  }, [resetGame]);

  const handleResetView = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div
      className="w-full h-screen relative overflow-hidden select-none"
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.background} 0%, #050a14 100%)`,
        cursor: 'grab',
      }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).style.cursor = 'grabbing';
      }}
      onPointerUp={(e) => {
        (e.target as HTMLElement).style.cursor = 'grab';
      }}
      onPointerLeave={(e) => {
        (e.target as HTMLElement).style.cursor = 'grab';
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 10], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[COLORS.background]} />
        <fog attach="fog" args={[COLORS.background, 15, 30]} />
        <MazeCube
          gameState={state}
          onCollision={() => {
            handleFirstInteraction();
            incrementCollision();
          }}
          onPitFall={() => {
            handleFirstInteraction();
            incrementPitFall();
          }}
          onWin={winGame}
          onRotationUpdate={handleRotationUpdate}
          onGravityUpdate={updateGravityFromRotation}
          resetTrigger={resetTrigger}
        />
      </Canvas>

      <StatusPanel gameState={state} />
      <ControlButtons onRestart={handleRestart} onResetView={handleResetView} />
      <VictoryModal gameState={state} onRestart={handleRestart} />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-cyan-500/20">
          <p className="text-gray-400 text-sm text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            🖱️ 拖拽旋转迷宫 · 引导金色小球到达绿色终点
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="text-gray-500 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          3D MAZE v1.0
        </div>
      </div>
    </div>
  );
}
