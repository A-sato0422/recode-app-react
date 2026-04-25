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
        <span className="text-2xl">↺</span>
        <span className="text-xs">5</span>
      </button>

      {/* 再生・一時停止 */}
      <button onClick={onToggle} className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl active:scale-90 transition-transform">
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* 5秒送り */}
      <button onClick={onSkipForward} className="flex flex-col items-center text-gray-500 active:scale-90 transition-transform">
        <span className="text-2xl">↻</span>
        <span className="text-xs">5</span>
      </button>
    </div>
  );
};
