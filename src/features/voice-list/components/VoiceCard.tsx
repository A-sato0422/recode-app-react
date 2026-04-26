import { useNavigate } from "react-router-dom";
import type { Voice } from "../../../shared/types/voice";

// サンプルデザインに合わせたカード背景色
const CARD_COLORS = ["#FF8FAB", "#E8445A", "#5B5BD6", "#F5A623", "#87CEEB", "#FF6347", "#9B7EC8", "#5BB974", "#FF69B4"];

const DEFAULT_THUMBNAIL = "/default-thumbnail.svg";

type Props = {
  voice: Voice;
  index: number;
  isEditMode: boolean;
  onDelete: (id: string) => void;
};

export const VoiceCard = ({ voice, index, isEditMode, onDelete }: Props) => {
  const navigate = useNavigate();
  const bgColor = CARD_COLORS[index % CARD_COLORS.length];
  const thumbnailUrl = voice.thumbnail_url ?? DEFAULT_THUMBNAIL;

  const handleClick = () => {
    if (!isEditMode) navigate(`/player/${voice.id}`);
  };

  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer relative" onClick={handleClick}>
      <div className="w-full aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
        {voice.thumbnail_url ? (
          <img src={thumbnailUrl} alt={voice.label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{voice.label[0]}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 text-center w-full truncate">{voice.label}</p>

      {/* 編集モード時に削除ボタンを表示 */}
      {isEditMode && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(voice.id); }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
        >
          ✕
        </button>
      )}
    </div>
  );
};
