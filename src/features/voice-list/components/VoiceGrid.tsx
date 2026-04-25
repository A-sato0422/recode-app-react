import type { Voice } from "../../../shared/types/voice";
import { VoiceCard } from "./VoiceCard";

type Props = {
  voices: Voice[];
};

export const VoiceGrid = ({ voices }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {voices.map((voice, index) => (
        <VoiceCard key={voice.id} voice={voice} index={index} />
      ))}
    </div>
  );
};
