import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { useRecorder } from "../hooks/useRecorder";
import { useThumbnailUpload } from "../hooks/useThumbnailUpload";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { useAuth } from "../../auth/hooks/useAuth";

type Props = {
  userId: string;
  onClose: () => void;
};

export const RecorderModal = ({ userId, onClose }: Props) => {
  const { user } = useAuth();
  const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, resetRecording } = useRecorder();
  const { thumbnailFile, thumbnailPreviewUrl, selectThumbnail, clearThumbnail } = useThumbnailUpload();
  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  // audioBlobが変わったら（撮り直し時など）プレビューをリセット
  useEffect(() => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setIsPreviewPlaying(false);
  }, [audioBlob]);

  const togglePreview = () => {
    if (!audioBlob) return;
    if (!previewAudioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.addEventListener("ended", () => {
        setIsPreviewPlaying(false);

        // 一時URLのメモリのみ開放（音声を削除するわけではない）
        URL.revokeObjectURL(url);
        previewAudioRef.current = null;
      });
      previewAudioRef.current = audio;
    }
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const saveVoice = async () => {
    if (!audioBlob || !label.trim() || !user) return;
    setIsSaving(true);
    try {
      const ext = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      // フォルダ名：各アカウントのUUID、ファイル名：randomUUID()で生成した文字列
      const audioPath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("voice-recordings")
        .upload(audioPath, audioBlob);
      if (uploadError) throw uploadError;

      let thumbnailPath = null;
      if (thumbnailFile) {
        thumbnailPath = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: thumbError } = await supabase.storage
          .from("voice-thumbnails")
          .upload(thumbnailPath, thumbnailFile);
        if (thumbError) throw thumbError;
      }

      const { error: insertError } = await supabase.from("voices").insert({
        user_id: user.id,
        label: label.trim(),
        audio_path: audioPath,
        thumbnail_path: thumbnailPath,
        duration: recordingTime,
      });
      if (insertError) throw insertError;

      await queryClient.invalidateQueries({ queryKey: ["voices", userId] });
      handleClose();
    } catch (e) {
      console.error("保存失敗:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    resetRecording();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-center">録音</h2>

        {/* タイマー */}
        <p className="text-4xl font-mono text-center text-gray-700">{formatTime(recordingTime)}</p>

        {/* 録音ボタン */}
        <div className="flex justify-center">
          {!isRecording && !audioBlob && (
            <button onClick={startRecording} className="w-16 h-16 rounded-full bg-red-500 text-white text-sm font-bold">
              録音
            </button>
          )}
          {isRecording && (
            <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-gray-500 text-white text-sm font-bold">
              停止
            </button>
          )}
          {audioBlob && !isRecording && (
            <div className="flex items-center gap-4">
              <button onClick={togglePreview} className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                {isPreviewPlaying ? "停止" : "再生"}
              </button>
              <button onClick={resetRecording} className="w-16 h-16 rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
                撮り直し
              </button>
            </div>
          )}
        </div>

        {/* ラベル入力・サムネイル */}
        {audioBlob && (
          <div className="space-y-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ラベルを入力（例: おはよう）"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <ThumbnailPicker
              previewUrl={thumbnailPreviewUrl}
              onSelect={selectThumbnail}
              onClear={clearThumbnail}
            />
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2">
          <button onClick={handleClose} className="flex-1 py-2 rounded-lg border text-gray-600 text-sm">
            キャンセル
          </button>
          {audioBlob && (
            <button onClick={saveVoice} disabled={!label.trim() || isSaving} className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold disabled:opacity-50">
              {isSaving ? "保存中..." : "保存"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
