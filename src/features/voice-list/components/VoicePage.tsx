import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { useVoices } from "../hooks/useVoices";
import { VoiceGrid } from "./VoiceGrid";
import { RecorderModal } from "../../voice-recorder/components/RecorderModal";

type Props = {
  title: string;
  userId: string;
  bgColor: string;
  canRecord: boolean;
};

export const VoicePage = ({ title, userId, bgColor, canRecord }: Props) => {
  const { data: voices, isLoading, isError, refetch } = useVoices(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("voices").update({ is_deleted: true }).eq("id", id);
    if (!error) {
      await queryClient.invalidateQueries({ queryKey: ["voices", userId] });
    }
  };

  return (
    <div className={`min-h-svh flex flex-col ${bgColor}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold text-green-600">{title}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="text-green-600" aria-label="リロード">
            ↺
          </button>
          {canRecord && (
            <button onClick={() => setIsEditMode(!isEditMode)} className="text-green-600 text-sm">
              {isEditMode ? "完了" : "編集"}
            </button>
          )}
          {canRecord && !isEditMode && (
            <button onClick={() => setIsModalOpen(true)} className="bg-green-400 text-white text-sm px-3 py-1 rounded-full">
              + 録音
            </button>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 pt-2 pb-8">
        {isLoading && <p className="text-center text-gray-400 mt-8">読み込み中...</p>}
        {isError && <p className="text-center text-red-400 mt-8">読み込みに失敗しました</p>}
        {voices && voices.length === 0 && <p className="text-center text-gray-400 mt-8">まだ音声がありません</p>}
        {voices && voices.length > 0 && <VoiceGrid voices={voices} isEditMode={isEditMode} onDelete={handleDelete} />}
      </div>

      {isModalOpen && <RecorderModal userId={userId} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
