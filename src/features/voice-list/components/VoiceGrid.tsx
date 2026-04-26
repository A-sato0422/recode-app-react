import type { Voice } from "../../../shared/types/voice";
import { VoiceCard } from "./VoiceCard";

type Props = {
  voices: Voice[];
  isEditMode: boolean;
  onDelete: (id: string) => void;
};

export const VoiceGrid = ({ voices, isEditMode, onDelete }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {voices.map((voice, index) => (
        <VoiceCard key={voice.id} voice={voice} index={index} isEditMode={isEditMode} onDelete={onDelete} />
      ))}
    </div>
  );
};
