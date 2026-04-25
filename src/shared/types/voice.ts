export type Voice = {
  id: string;
  user_id: string;
  label: string;
  audio_path: string;
  audio_url?: string;
  thumbnail_path: string | null;
  thumbnail_url?: string | null;
  duration: number | null;
  is_deleted: boolean;
  created_at: string;
  keep_alive_at: string;
};

export type CreateVoiceInput = {
  label: string;
  audioBlob: Blob;
  duration: number;
  thumbnailFile?: File | null;
};
