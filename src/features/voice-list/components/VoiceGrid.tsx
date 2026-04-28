import type { Voice } from "../../../shared/types/voice";
import { VoiceCard } from "./VoiceCard";

type Props = {
  voices: Voice[];
  isEditMode: boolean;
  onDelete: (id: string) => void;
};

export const VoiceGrid = ({ voices, isEditMode, onDelete }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-5 p-5">
      {voices.map((voice) => (
        <VoiceCard key={voice.id} voice={voice} isEditMode={isEditMode} onDelete={onDelete} />
      ))}
    </div>
  );
};
