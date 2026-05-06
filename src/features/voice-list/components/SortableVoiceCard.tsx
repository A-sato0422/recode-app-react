import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VoiceCard } from "./VoiceCard";
import type { Voice } from "../../../shared/types/voice";

type Props = {
  voice: Voice;
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onCardClick: (voice: Voice) => void;
};

export const SortableVoiceCard = ({ voice, isEditMode, onDelete, onCardClick }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: voice.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
    ...(isEditMode && { WebkitTouchCallout: "none", userSelect: "none" } as React.CSSProperties),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      className={isEditMode ? "touch-none" : undefined}
    >
      <VoiceCard voice={voice} isEditMode={isEditMode} onDelete={onDelete} onCardClick={onCardClick} />
    </div>
  );
};
