import { useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { useVoices } from "../hooks/useVoices";
import { useAuth } from "../../auth/hooks/useAuth";
import { VoiceGrid } from "./VoiceGrid";
import { RecorderModal } from "../../voice-recorder/components/RecorderModal";
import type { Voice } from "../../../shared/types/voice";

const ACCENT_COLORS = {
  green: {
    text: "text-green-600",
    recordBtn: "bg-green-400",
    border: "border-green-200",
  },
  blue: {
    text: "text-blue-500",
    recordBtn: "bg-blue-400",
    border: "border-blue-200",
  },
};

type Props = {
  title: string;
  userId: string;
  bgColor: string;
  accentColor: "green" | "blue";
  canRecord: boolean;
  isVisible: boolean; // 登録ボタンの表示切替
  onCardClick: (voice: Voice) => void;
};

export const VoicePage = ({ title, userId, bgColor, accentColor, canRecord, isVisible, onCardClick }: Props) => {
  const { data: voices, isLoading, isError, refetch } = useVoices(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();
  const colors = ACCENT_COLORS[accentColor];
  const { signOut } = useAuth();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("voices").update({ is_deleted: true }).eq("id", id);
    if (!error) {
      await queryClient.invalidateQueries({ queryKey: ["voices", userId] });
    }
  };

  return (
    <div className={`min-h-svh flex flex-col ${bgColor}`}>
      {/* ヘッダー */}
      <div className={`flex items-center justify-between px-4 py-4 border-b ${colors.border}`}>
        <h1 className={`text-2xl font-bold ${colors.text}`}>{title}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className={colors.text} aria-label="リロード">
            ↺
          </button>
          <button onClick={signOut} className={`${colors.text} text-sm`} aria-label="ログアウト">
            ログアウト
          </button>
          {canRecord && (
            <button onClick={() => setIsEditMode(!isEditMode)} className={`${colors.text} text-sm`}>
              {isEditMode ? "完了" : "編集"}
            </button>
          )}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 pt-2 pb-8">
        {isLoading && <p className="text-center text-gray-400 mt-8">読み込み中...</p>}
        {isError && <p className="text-center text-red-400 mt-8">読み込みに失敗しました</p>}
        {voices && voices.length === 0 && <p className="text-center text-gray-400 mt-8">まだ音声がありません</p>}
        {voices && voices.length > 0 && <VoiceGrid voices={voices} isEditMode={isEditMode} onDelete={handleDelete} onCardClick={onCardClick} />}
      </div>

      {/* 録音FABボタン — portal で transform の影響を回避し fixed を viewport 基準にする */}
      {canRecord &&
        !isEditMode &&
        isVisible &&
        createPortal(
          <button onClick={() => setIsModalOpen(true)} className={`fixed bottom-8 right-6 w-14 h-14 rounded-full ${colors.recordBtn} text-white text-2xl shadow-lg flex items-center justify-center`} aria-label="録音">
            ＋
          </button>,
          document.body,
        )}

      {isModalOpen && <RecorderModal userId={userId} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
