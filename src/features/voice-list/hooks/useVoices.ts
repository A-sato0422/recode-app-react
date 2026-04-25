import { useQuery } from "@tanstack/react-query";
import { MOCK_SATOSHI_VOICES, MOCK_MINA_VOICES, SATOSHI_USER_ID } from "../../../shared/lib/mockData";

// ステップ7でSupabaseのクエリに切り替える
const fetchVoices = async (userId: string) => {
  if (userId === SATOSHI_USER_ID) return MOCK_SATOSHI_VOICES;
  return MOCK_MINA_VOICES;
};

export const useVoices = (userId: string) => {
  return useQuery({
    queryKey: ["voices", userId],
    queryFn: () => fetchVoices(userId),
  });
};

// ステップ7でSupabaseのクエリに切り替える
export const useVoiceById = (id: string) => {
  return useQuery({
    queryKey: ["voice", id],
    queryFn: async () => {
      const all = [...MOCK_SATOSHI_VOICES, ...MOCK_MINA_VOICES];
      return all.find((v) => v.id === id) ?? null;
    },
  });
};
