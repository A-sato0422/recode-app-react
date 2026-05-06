import type { Voice } from "../../../shared/types/voice";

const DEFAULT_THUMBNAIL = "/default-thumbnail.svg";

type Props = {
  voice: Voice;
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onCardClick: (voice: Voice) => void;
};

export const VoiceCard = ({ voice, isEditMode, onDelete, onCardClick }: Props) => {
  const thumbnailUrl = voice.thumbnail_url ?? DEFAULT_THUMBNAIL;

  const handleClick = () => {
    if (!isEditMode) onCardClick(voice);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer relative" onClick={handleClick}>
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 [filter:drop-shadow(4px_8px_2px_rgba(0,0,0,0.2))]">
        <img src={thumbnailUrl} alt={voice.label} className="w-full h-full object-cover" />
      </div>
      <p className="text-xs text-gray-600 text-center w-full truncate">{voice.label}</p>

      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(voice.id);
          }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
        >
          ✕
        </button>
      )}
    </div>
  );
};
