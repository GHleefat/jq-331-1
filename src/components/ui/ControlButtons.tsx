import { RotateCcw, Home } from 'lucide-react';

interface ControlButtonsProps {
  onRestart: () => void;
  onResetView: () => void;
}

export function ControlButtons({ onRestart, onResetView }: ControlButtonsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
      <button
        onClick={onRestart}
        className="group flex items-center gap-2 px-4 py-3 bg-black/60 backdrop-blur-md rounded-xl border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <RotateCcw className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        <span className="text-cyan-400 font-medium tracking-wider group-hover:text-cyan-300 transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          重新开始
        </span>
      </button>

      <button
        onClick={onResetView}
        className="group flex items-center gap-2 px-4 py-3 bg-black/60 backdrop-blur-md rounded-xl border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Home className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
        <span className="text-purple-400 font-medium tracking-wider group-hover:text-purple-300 transition-colors" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          重置视角
        </span>
      </button>
    </div>
  );
}
