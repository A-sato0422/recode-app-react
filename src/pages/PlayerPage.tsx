import { useParams, useNavigate } from "react-router-dom";
import { useVoiceById } from "../features/voice-list/hooks/useVoices";
import { PlayerScreen } from "../features/voice-player/components/PlayerScreen";

export const PlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: voice, isLoading, isError } = useVoiceById(id ?? "");

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (isError || !voice) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">音声が見つかりませんでした</p>
        <button onClick={() => navigate("/")} className="text-green-500 underline text-sm">ホームに戻る</button>
      </div>
    );
  }

  return <PlayerScreen voice={voice} />;
};
