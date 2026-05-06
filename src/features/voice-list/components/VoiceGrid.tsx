import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Voice } from "../../../shared/types/voice";
import { SortableVoiceCard } from "./SortableVoiceCard";

type Props = {
  voices: Voice[];
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onCardClick: (voice: Voice) => void;
  onReorder: (orderedIds: string[]) => void;
};

export const VoiceGrid = ({ voices, isEditMode, onDelete, onCardClick, onReorder }: Props) => {
  const [items, setItems] = useState<Voice[]>(voices);

  useEffect(() => {
    setItems(voices);
  }, [voices]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((v) => v.id === active.id);
      const newIndex = current.findIndex((v) => v.id === over.id);
      const reordered = arrayMove(current, oldIndex, newIndex);
      onReorder(reordered.map((v) => v.id));
      return reordered;
    });
  };

  if (!isEditMode) {
    return (
      <div className="grid grid-cols-3 gap-5 p-5">
        {items.map((voice) => (
          <SortableVoiceCard key={voice.id} voice={voice} isEditMode={false} onDelete={onDelete} onCardClick={onCardClick} />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-5 p-5">
          {items.map((voice) => (
            <SortableVoiceCard key={voice.id} voice={voice} isEditMode={true} onDelete={onDelete} onCardClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
