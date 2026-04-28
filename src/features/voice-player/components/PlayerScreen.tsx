import { useState } from "react";
import type { Voice } from "../../../shared/types/voice";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { AudioControls } from "./AudioControls";

const DEFAULT_THUMBNAIL = "/default-thumbnail.svg";

// 秒数を "0:00" 形式に変換
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ISO文字列を "YYYY-MM-DD HH:mm" 形式に変換
const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type Props = {
  voice: Voice;
  onClose: () => void;
};

export const PlayerScreen = ({ voice, onClose }: Props) => {
  const [isClosing, setIsClosing] = useState(false);
  const { isPlaying, currentTime, duration, toggle, seek, skipBackward, skipForward } = useAudioPlayer(voice.audio_url ?? "");

  const thumbnailUrl = voice.thumbnail_url ?? DEFAULT_THUMBNAIL;
  // Audioのdurationの方が制度が良いので優先する
  const totalDuration = (duration > 0 && isFinite(duration)) ? duration : (voice.duration ?? 0);

  const handleBack = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-gray-100 to-white px-6 ${isClosing ? "animate-slide-down" : "animate-slide-up"}`}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* 戻るボタン（∨ = 下に閉じる） */}
      <button onClick={handleBack} className="mt-8 self-start text-gray-400 active:translate-y-1 transition-transform duration-100" aria-label="閉じる">
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
          <path d="M2 2l10 12L22 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* サムネイル */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-xl">
          <img src={thumbnailUrl} alt={voice.label} className="w-full h-full object-cover" />
        </div>

        {/* ラベル・日時 */}
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{voice.label}</p>
          <p className="text-sm text-gray-400 mt-1">{formatDate(voice.created_at)}</p>
        </div>

        {/* シークバー */}
        <div className="w-full">
          <div className="relative w-full h-1.5 bg-gray-300 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-gray-700 rounded-full pointer-events-none"
              style={{
                width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%`,
                transition: "width 0.25s linear",
              }}
            />
            <input type="range" min={0} max={totalDuration} value={currentTime} step={0.1} onChange={(e) => seek(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* コントロール */}
        <AudioControls isPlaying={isPlaying} onToggle={toggle} onSkipBackward={skipBackward} onSkipForward={skipForward} />
      </div>
    </div>
  );
};
