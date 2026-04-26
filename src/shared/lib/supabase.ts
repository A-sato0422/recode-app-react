import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// storageに保存したパス文字列をブラウザが読み込める完全なURLとして成形
export const getAudioUrl = (path: string) =>
  supabase.storage.from('voice-recordings').getPublicUrl(path).data.publicUrl;

export const getThumbnailUrl = (path: string | null) =>
  path
    ? supabase.storage.from('voice-thumbnails').getPublicUrl(path).data.publicUrl
    : null;
