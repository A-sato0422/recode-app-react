import type { Voice } from '../types/voice';

const SATOSHI_USER_ID = 'mock-satoshi-user-id';
const MINA_USER_ID = 'mock-mina-user-id';

export const MOCK_SATOSHI_VOICES: Voice[] = [
  { id: '1', user_id: SATOSHI_USER_ID, label: 'おはよう', audio_path: '', duration: 3, is_deleted: false, thumbnail_path: null, created_at: '2025-12-02T07:28:00Z', keep_alive_at: '2025-12-02T07:28:00Z' },
  { id: '2', user_id: SATOSHI_USER_ID, label: '大好き', audio_path: '', duration: 2, is_deleted: false, thumbnail_path: null, created_at: '2025-12-01T22:00:00Z', keep_alive_at: '2025-12-01T22:00:00Z' },
  { id: '3', user_id: SATOSHI_USER_ID, label: 'おやすみ', audio_path: '', duration: 4, is_deleted: false, thumbnail_path: null, created_at: '2025-11-30T23:00:00Z', keep_alive_at: '2025-11-30T23:00:00Z' },
  { id: '4', user_id: SATOSHI_USER_ID, label: 'お疲れ', audio_path: '', duration: 3, is_deleted: false, thumbnail_path: null, created_at: '2025-11-29T20:00:00Z', keep_alive_at: '2025-11-29T20:00:00Z' },
  { id: '5', user_id: SATOSHI_USER_ID, label: 'ぴゅっ', audio_path: '', duration: 1, is_deleted: false, thumbnail_path: null, created_at: '2025-11-28T18:00:00Z', keep_alive_at: '2025-11-28T18:00:00Z' },
  { id: '6', user_id: SATOSHI_USER_ID, label: 'ガァッ', audio_path: '', duration: 2, is_deleted: false, thumbnail_path: null, created_at: '2025-11-27T15:00:00Z', keep_alive_at: '2025-11-27T15:00:00Z' },
];

export const MOCK_MINA_VOICES: Voice[] = [
  { id: '7', user_id: MINA_USER_ID, label: '大好き', audio_path: '', duration: 3, is_deleted: false, thumbnail_path: null, created_at: '2025-12-02T10:00:00Z', keep_alive_at: '2025-12-02T10:00:00Z' },
  { id: '8', user_id: MINA_USER_ID, label: '舌根沈下だ', audio_path: '', duration: 5, is_deleted: false, thumbnail_path: null, created_at: '2025-12-01T09:00:00Z', keep_alive_at: '2025-12-01T09:00:00Z' },
  { id: '9', user_id: MINA_USER_ID, label: 'うーうん', audio_path: '', duration: 2, is_deleted: false, thumbnail_path: null, created_at: '2025-11-30T20:00:00Z', keep_alive_at: '2025-11-30T20:00:00Z' },
  { id: '10', user_id: MINA_USER_ID, label: 'うまぁい', audio_path: '', duration: 3, is_deleted: false, thumbnail_path: null, created_at: '2025-11-29T12:00:00Z', keep_alive_at: '2025-11-29T12:00:00Z' },
  { id: '11', user_id: MINA_USER_ID, label: '大丈夫ぅ', audio_path: '', duration: 4, is_deleted: false, thumbnail_path: null, created_at: '2025-11-28T11:00:00Z', keep_alive_at: '2025-11-28T11:00:00Z' },
  { id: '12', user_id: MINA_USER_ID, label: 'さとくんのさとくん', audio_path: '', duration: 6, is_deleted: false, thumbnail_path: null, created_at: '2025-11-27T10:00:00Z', keep_alive_at: '2025-11-27T10:00:00Z' },
];

export { SATOSHI_USER_ID, MINA_USER_ID };
