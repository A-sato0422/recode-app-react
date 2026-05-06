import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import type { Voice } from "../../../shared/types/voice";

const updateVoiceOrder = async (orderedIds: string[]): Promise<void> => {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("voices")
        .update({ sort_order: orderedIds.length - index })
        .eq("id", id)
    )
  );
  const err = results.find((r) => r.error)?.error;
  if (err) throw err;
};

// UI優先の楽観的更新を実装
export const useUpdateVoiceOrder = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVoiceOrder,
    // mutationFnの実行前に走る
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["voices", userId] });
      // キャッシュを直接書き換えて、UI上の見た目を更新（supabase連携は後）
      const previousVoices = queryClient.getQueryData<Voice[]>(["voices", userId]);
      queryClient.setQueryData(["voices", userId], (old: Voice[] | undefined) => {
        if (!old) return old;
        return orderedIds
          .map((id) => old.find((v) => v.id === id))
          .filter(Boolean) as Voice[];
      });
      return { previousVoices };
    },
    // mutationFn失敗時
    onError: (_err, _ids, context: { previousVoices?: Voice[] } | undefined) => {
      if (context?.previousVoices) {
        queryClient.setQueryData(["voices", userId], context.previousVoices);
      }
    },
    // mutationFn成功/失敗時両方
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["voices", userId] });
    },
  });
};
