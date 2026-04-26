import { useState } from "react";
import { useVoices } from "../hooks/useVoices";
import { VoiceGrid } from "./VoiceGrid";
import { RecorderModal } from "../../voice-recorder/components/RecorderModal";

type Props = {
  title: string;
  userId: string;
  bgColor: string; // Tailwindクラス例: "bg-green-50"
  canRecord: boolean; // 自分のページかどうか
};

export const VoicePage = ({ title, userId, bgColor, canRecord }: Props) => {
  const { data: voices, isLoading, isError, refetch } = useVoices(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={`min-h-svh flex flex-col ${bgColor}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-green-600">{title}</h1>
        <div className="flex items-center gap-3">
          {/* リロードボタン */}
          <button onClick={() => refetch()} className="text-green-600" aria-label="リロード">
            ↺
          </button>
          {/* 編集ボタン（ステップ10で実装） */}
          <button className="text-green-600 text-sm">編集</button>
          {/* 録音ボタン：自分のページのみ表示 */}
          {canRecord && (
            <button onClick={() => setIsModalOpen(true)} className="bg-green-400 text-white text-sm px-3 py-1 rounded-full">+ 録音</button>
          )}
        </div>
      </div>

      {isModalOpen && <RecorderModal userId={userId} onClose={() => setIsModalOpen(false)} />}

      {/* コンテンツ */}
      <div className="flex-1 pt-2 pb-8">
        {isLoading && <p className="text-center text-gray-400 mt-8">読み込み中...</p>}
        {isError && <p className="text-center text-red-400 mt-8">読み込みに失敗しました</p>}
        {voices && voices.length === 0 && <p className="text-center text-gray-400 mt-8">まだ音声がありません</p>}
        {voices && voices.length > 0 && <VoiceGrid voices={voices} />}
      </div>
    </div>
  );
};
