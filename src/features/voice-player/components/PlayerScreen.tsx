import { useNavigate } from "react-router-dom";
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
};

export const PlayerScreen = ({ voice }: Props) => {
  const navigate = useNavigate();
  const { isPlaying, currentTime, duration, toggle, seek, skipBackward, skipForward } = useAudioPlayer(voice.audio_url ?? "");

  const thumbnailUrl = voice.thumbnail_url ?? DEFAULT_THUMBNAIL;
  // durationはSupabase連携前はvoiceのdurationを使う
  const totalDuration = duration || voice.duration || 0;

  return (
    <div className="min-h-svh flex flex-col bg-gradient-to-b from-gray-100 to-white px-6">
      {/* 戻るボタン */}
      <button onClick={() => navigate(-1)} className="mt-4 self-start text-gray-500 text-xl">
        ←
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
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-gray-800"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
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
