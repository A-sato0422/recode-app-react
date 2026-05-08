import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useUpdateVoice } from "../hooks/useUpdateVoice";
import { useThumbnailUpload } from "../../voice-recorder/hooks/useThumbnailUpload";
import type { Voice } from "../../../shared/types/voice";

const DEFAULT_THUMBNAIL = "/default-thumbnail.svg";

type Props = {
  voice: Voice;
  userId: string;
  onClose: () => void;
};

export const VoiceEditModal = ({ voice, userId, onClose }: Props) => {
  const [label, setLabel] = useState(voice.label);
  const { thumbnailFile, thumbnailPreviewUrl, selectThumbnail, clearThumbnail } = useThumbnailUpload();
  const { mutateAsync: updateVoice, isPending } = useUpdateVoice(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayThumbnailUrl = thumbnailPreviewUrl ?? voice.thumbnail_url ?? DEFAULT_THUMBNAIL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectThumbnail(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!label.trim() || isPending) return;
    await updateVoice({
      id: voice.id,
      userId,
      label: label.trim(),
      thumbnailFile,
      currentThumbnailPath: voice.thumbnail_path,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-center">音声を編集</h2>

        {/* サムネイル */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-32 h-32 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={displayThumbnailUrl} alt={voice.label} className="w-32 h-32 object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black/35 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xs font-medium">画像を変更</span>
            </div>
          </div>
          {thumbnailPreviewUrl && (
            <button onClick={clearThumbnail} className="text-xs text-gray-400 underline">
              変更を取り消す
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* タイトル */}
        <div className="space-y-1">
          <p className="text-xs text-gray-400">タイトル</p>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base"
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-gray-600 text-sm">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim() || isPending}
            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
