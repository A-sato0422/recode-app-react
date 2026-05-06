import { useQuery } from "@tanstack/react-query";
import { supabase, getAudioUrl, getThumbnailUrl } from "../../../shared/lib/supabase";
import type { Voice } from "../../../shared/types/voice";

const fetchVoices = async (userId: string): Promise<Voice[]> => {
  const { data, error } = await supabase.from("voices").select("*").eq("user_id", userId).eq("is_deleted", false).order("sort_order", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // 音声とサムネイルデータをマッピングして返す
  return data.map((v) => ({
    ...v,
    audio_url: getAudioUrl(v.audio_path),
    thumbnail_url: getThumbnailUrl(v.thumbnail_path),
  }));
};

const fetchVoiceById = async (id: string): Promise<Voice | null> => {
  const { data, error } = await supabase.from("voices").select("*").eq("id", id).eq("is_deleted", false).single();

  if (error) throw error;
  if (!data) return null;

  // 音声とサムネイルデータをマッピングして返す
  return {
    ...data,
    audio_url: getAudioUrl(data.audio_path),
    thumbnail_url: getThumbnailUrl(data.thumbnail_path),
  };
};

export const useVoices = (userId: string) => {
  return useQuery({
    queryKey: ["voices", userId],
    queryFn: () => fetchVoices(userId),
    enabled: !!userId,
  });
};

export const useVoiceById = (id: string) => {
  return useQuery({
    queryKey: ["voice", id],
    queryFn: () => fetchVoiceById(id),
    enabled: !!id,
  });
};

export { getAudioUrl, getThumbnailUrl };
