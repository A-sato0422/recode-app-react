import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

type Props = {
  isPlaying: boolean;
  onToggle: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
};

export const AudioControls = ({ isPlaying, onToggle, onSkipBackward, onSkipForward }: Props) => {
  return (
    <div className="flex items-center justify-center gap-10">
      {/* 5秒戻し */}
      <button onClick={onSkipBackward} className="flex flex-col items-center text-gray-500 active:scale-90 transition-transform">
        <RotateCcw size={24} />
        <span className="text-xs">5</span>
      </button>

      {/* 再生・一時停止 */}
      <button onClick={onToggle} className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center active:scale-90 transition-transform">
        {isPlaying ? <Pause size={28} fill="white" stroke="none" /> : <Play size={28} fill="white" stroke="none" />}
      </button>

      {/* 5秒送り */}
      <button onClick={onSkipForward} className="flex flex-col items-center text-gray-500 active:scale-90 transition-transform">
        <RotateCw size={24} />
        <span className="text-xs">5</span>
      </button>
    </div>
  );
};
