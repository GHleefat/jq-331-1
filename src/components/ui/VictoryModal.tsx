import { Trophy, Clock, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import type { GameStateData } from '../../hooks/useGameState';

interface VictoryModalProps {
  gameState: GameStateData;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function VictoryModal({ gameState, onRestart }: VictoryModalProps) {
  if (gameState.status !== 'won') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl p-8 border border-green-500/40 shadow-2xl shadow-green-500/20 max-w-md w-full mx-4 animate-bounce-in">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            恭喜通关!
          </h2>
          <p className="text-gray-400 mb-6">你成功引导小球到达了终点</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
              <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">用时</div>
              <div className="text-cyan-300 text-lg font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatTime(gameState.elapsedTime)}
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-yellow-500/30">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">碰撞</div>
              <div className="text-yellow-300 text-lg font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {gameState.collisionCount}
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">掉落</div>
              <div className="text-red-300 text-lg font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {gameState.pitFallCount}
              </div>
            </div>
          </div>

          <button
            onClick={onRestart}
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl font-bold text-white text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            再玩一次
          </button>
        </div>

        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#2ed573', '#00f5ff', '#ffd700', '#ff4757', '#a855f7'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
