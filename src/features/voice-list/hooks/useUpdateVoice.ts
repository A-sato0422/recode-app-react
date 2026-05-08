import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";

type UpdateVoiceInput = {
  id: string;
  userId: string;
  label: string;
  thumbnailFile?: File | null;
  currentThumbnailPath: string | null;
};

const updateVoice = async ({ id, userId, label, thumbnailFile, currentThumbnailPath }: UpdateVoiceInput) => {
  let thumbnail_path = currentThumbnailPath;

  if (thumbnailFile) {
    const ext = thumbnailFile.name.split(".").pop() ?? "jpg";
    const newPath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("voice-thumbnails").upload(newPath, thumbnailFile);
    if (uploadError) throw uploadError;
    thumbnail_path = newPath;
  }

  const { error } = await supabase.from("voices").update({ label, thumbnail_path }).eq("id", id);
  if (error) throw error;
};

export const useUpdateVoice = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voices", userId] });
    },
  });
};
