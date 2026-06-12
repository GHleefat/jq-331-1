import { Clock, Zap, AlertTriangle } from 'lucide-react';
import type { GameStateData } from '../../hooks/useGameState';

interface StatusPanelProps {
  gameState: GameStateData;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function StatusPanel({ gameState }: StatusPanelProps) {
  return (
    <div className="absolute top-4 left-4 z-10 font-mono">
      <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
        <h2 className="text-cyan-400 text-lg font-bold mb-3 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          3D MAZE
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">时间</div>
              <div className="text-cyan-300 text-xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatTime(gameState.elapsedTime)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">碰撞</div>
              <div className="text-yellow-300 text-xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {gameState.collisionCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">掉落</div>
              <div className="text-red-300 text-xl font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {gameState.pitFallCount}
              </div>
            </div>
          </div>
        </div>

        {gameState.status === 'idle' && (
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <p className="text-gray-300 text-sm text-center animate-pulse">
              拖拽屏幕开始旋转
            </p>
          </div>
        )}

        {gameState.status === 'playing' && (
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm">游戏进行中</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
