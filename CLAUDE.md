# サトボイス / ミナボイス — CLAUDE.md

## プロジェクト概要

遠距離恋愛カップル向けの音声共有アプリ。  
録音した音声をカード形式で一覧表示し、タップするとSpotify風の再生画面が表示される。  
**サトボイス（Satoshi側）** と **ミナボイス（Mina側）** の2画面を横スクロールで切り替える。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + TypeScript + Vite |
| バックエンド/DB | Supabase (Storage + PostgreSQL + Auth) |
| デプロイ | Vercel |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | TanStack Query v5 (サーバー状態) + useState/useReducer (ローカル状態) |
| スワイプ | react-swipeable |
| バッチ処理 | GitHub Actions |

---

## ユーザー設計

### ユーザーの種類

| ユーザー | メールアドレス例 | 役割 |
|---|---|---|
| Satoshi | achira0422@gmail.com | サトボイスの録音者 |
| Mina | mina@ex.com | ミナボイスの録音者 |

### 画面の見え方

- **どちらのユーザーでログインしても**、横スクロールで両方のページを閲覧できる
- 録音できるのは**自分のページのみ**（自分のuser_idに紐づくデータのみ挿入可能）

---

## Supabase 設計

### テーブル: `voices`

```sql
CREATE TABLE voices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id),  -- 録音者のユーザーID
  label          TEXT        NOT NULL,          -- カード下のラベル（例: "おはよう"）
  audio_path     TEXT        NOT NULL,          -- Supabase Storage のパス
  thumbnail_path TEXT        DEFAULT NULL,      -- サムネイル画像の Storage パス（任意）
  duration       NUMERIC     DEFAULT NULL,      -- 再生時間（秒）
  is_deleted     BOOLEAN     DEFAULT FALSE,      --論理削除フラグ（FALSEなら有効）
  created_at     TIMESTAMPTZ DEFAULT now(),
  -- ダミー更新用カラム（Supabase無料プランのスリープ対策）
  keep_alive_at  TIMESTAMPTZ DEFAULT now()
);
```

### RLS ポリシー

```sql
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

-- 全員が有効な音声を閲覧可能（パートナーの音声も見える）
CREATE POLICY "anyone can read active voices"
  ON voices FOR SELECT
  USING (deleted_at IS NULL);

-- 自分のデータのみ挿入可能
CREATE POLICY "users can insert own voices"
  ON voices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のデータのみ更新可能（論理削除・keep_alive更新）
CREATE POLICY "users can update own voices"
  ON voices FOR UPDATE
  USING (auth.uid() = user_id);
```

### Storage バケット構成

| バケット名 | Public | 用途 |
|---|---|---|
| `voice-recordings` | true | 音声ファイル（`.webm` / `.mp4`） |
| `voice-thumbnails` | true | サムネイル画像（`.jpg` / `.png` / `.webp`） |

**ファイルパス命名規則:**
- 音声: `{user_id}/{uuid}.webm`
- サムネイル: `{user_id}/{uuid}.jpg`

---

## 型定義

```typescript
// src/shared/types/voice.ts

export type Voice = {
  id: string;
  user_id: string;
  label: string;
  audio_path: string;             // Storage パス
  audio_url?: string;             // Public URL（クライアントで生成）
  thumbnail_path: string | null;  // Storage パス（任意）
  thumbnail_url?: string | null;  // Public URL（クライアントで生成）
  duration: number | null;
  is_deleted: boolean;
  created_at: string;
  keep_alive_at: string;
};

export type CreateVoiceInput = {
  label: string;
  audioBlob: Blob;
  duration: number;
  thumbnailFile?: File | null;    // 任意
};
```

---

## ディレクトリ構成（Feature-Sliced Design ベース）

```
src/
├── app/
│   ├── main.tsx
│   ├── App.tsx
│   └── router.tsx
├── features/
│   ├── auth/                    # 認証
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── index.ts
│   ├── voice-list/              # 音声一覧（ページ単位）
│   │   ├── components/
│   │   │   ├── VoicePage.tsx    # サトボイス or ミナボイス 1ページ分
│   │   │   ├── VoiceGrid.tsx
│   │   │   └── VoiceCard.tsx
│   │   ├── hooks/
│   │   │   └── useVoices.ts
│   │   └── index.ts
│   ├── voice-player/            # 再生画面
│   │   ├── components/
│   │   │   ├── PlayerScreen.tsx
│   │   │   └── AudioControls.tsx
│   │   ├── hooks/
│   │   │   └── useAudioPlayer.ts
│   │   └── index.ts
│   └── voice-recorder/          # 録音 + サムネイル設定
│       ├── components/
│       │   ├── RecorderModal.tsx
│       │   ├── RecordingVisualizer.tsx
│       │   └── ThumbnailPicker.tsx   # 画像選択UI
│       ├── hooks/
│       │   ├── useRecorder.ts
│       │   └── useThumbnailUpload.ts
│       └── index.ts
├── shared/
│   ├── lib/
│   │   └── supabase.ts
│   ├── types/
│   │   └── voice.ts
│   └── components/
│       └── ui/
└── pages/
    ├── LoginPage.tsx
    ├── HomePage.tsx          # 横スクロール2ページ構成
    └── PlayerPage.tsx
```

---

## 画面設計

### 1. ログイン画面 (`/login`)

- メールアドレス + パスワードの入力フォーム
- Supabase Auth の `signInWithPassword` を使用
- ログイン成功 → `/` にリダイレクト

```typescript
// useAuth.ts のインターフェース
const { user, signIn, signOut, isLoading } = useAuth();
```

### 2. ホーム画面 (`/`) — 横スワイプ2画面構成

```
← スワイプ ─────────────────────── スワイプ →

┌─────────────────────────┬─────────────────────────┐
│  サトボイスページ        │  ミナボイスページ        │
│  (Satoshiの録音一覧)    │  (Minaの録音一覧)       │
│         100vw           │         100vw           │
└─────────────────────────┴─────────────────────────┘
         ↑ 現在表示中                ↑ スワイプで表示
```

- 実装: `overflow-x: hidden` のラッパー内に `width: 200vw` のコンテナを配置し、`transform: translateX` でスライド
- ページインジケーター（ドット）を画面下部に表示して現在地を示す
- スワイプ検知: `onTouchStart` / `onTouchEnd` のタッチイベント、またはライブラリ `react-swipeable` を使用

**各ページの構成（共通）:**
- ヘッダー: 「サトボイス」or「ミナボイス」タイトル + リロード + 削除ボタン + 登録ボタン
- グリッド: 3列 × n行のカードレイアウト
- 各カード:
  - サムネイル画像が設定されている場合: その画像を表示
  - 設定されていない場合: `public/default-thumbnail.png` を表示
  - カード下にラベルテキスト
- 登録ボタン: **自分のページのみ表示**（ログインユーザーに対応するページのみ）

**自分のページ判定ロジック:**
```typescript
// Supabase Auth のメールアドレスでロールを判定
const isSatoshi = user?.email === import.meta.env.VITE_SATOSHI_EMAIL;
const isMina = user?.email === import.meta.env.VITE_MINA_EMAIL;
```

### 3. 再生画面 (`/player/:id`)
- 左上: 戻るボタン
- 中央: サムネイル画像（設定あり: その画像、なし: デフォルト画像 `public/default-thumbnail.png`）
- ラベル + 録音日時（`YYYY-MM-DD HH:mm` 形式）
- シークバー（0:00 〜 再生時間）
- コントロール: 5秒戻し / 再生・一時停止 / 5秒送り

---

## 機能仕様

### 認証フロー

```typescript
// ログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'satoshi@example.com',
  password: '...',
});

// ログアウト
await supabase.auth.signOut();

// セッション確認
const { data: { session } } = await supabase.auth.getSession();
```

- 未ログイン → `/login` にリダイレクト（React Router の保護ルート）
- セッションは localStorage に自動保存（Supabase デフォルト動作）

### 録音 + サムネイルアップロード

```typescript
// useRecorder.ts
const { isRecording, recordingTime, audioBlob, startRecording, stopRecording, resetRecording } = useRecorder();

// useThumbnailUpload.ts
const { thumbnailFile, thumbnailPreviewUrl, selectThumbnail, clearThumbnail } = useThumbnailUpload();

// 保存処理（RecorderModal内）
const saveVoice = async (input: CreateVoiceInput) => {
  // 1. 音声を Storage にアップロード
  const audioPath = `${user.id}/${crypto.randomUUID()}.webm`;
  await supabase.storage.from('voice-recordings').upload(audioPath, input.audioBlob);

  // 2. サムネイルを Storage にアップロード（任意）
  let thumbnailPath = null;
  if (input.thumbnailFile) {
    thumbnailPath = `${user.id}/${crypto.randomUUID()}.jpg`;
    await supabase.storage.from('voice-thumbnails').upload(thumbnailPath, input.thumbnailFile);
  }

  // 3. voices テーブルにレコード挿入
  await supabase.from('voices').insert({
    user_id: user.id,
    label: input.label,
    audio_path: audioPath,
    thumbnail_path: thumbnailPath,
    duration: input.duration,
  });
};
```

---

## カードの表示ロジック

```typescript
// VoiceCard.tsx
// デフォルト画像は public/default-thumbnail.png に配置
const DEFAULT_THUMBNAIL = '/default-thumbnail.png';

const VoiceCard = ({ voice }: { voice: Voice }) => {
  const thumbnailUrl = getThumbnailUrl(voice.thumbnail_path) ?? DEFAULT_THUMBNAIL;

  return (
    <div>
      <img src={thumbnailUrl} alt={voice.label} className="object-cover w-full h-full" />
      <p>{voice.label}</p>
    </div>
  );
};
```

---


## 環境変数 (`.env.local`)

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
VITE_SATOSHI_EMAIL=satoshi@example.com
VITE_MINA_EMAIL=mina@example.com
```

---

## バッチ処理 — Supabase スリープ対策（GitHub Actions）

Supabase 無料プランは **7日間アクセスがないとDBが一時停止**する。  
毎日 `keep_alive_at` を更新するバッチで対策する。

### `.github/workflows/keep-alive.yml`

```yaml
name: Supabase Keep Alive

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日 UTC 00:00（JST 09:00）
  workflow_dispatch:      # 手動実行も可能

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/keep_alive_ping" \
            -H "apikey: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

### Supabase 側の RPC 関数

```sql
-- GitHub Actions から呼び出される ping 関数
CREATE OR REPLACE FUNCTION keep_alive_ping()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE voices
  SET keep_alive_at = now()
  WHERE id = (SELECT id FROM voices ORDER BY created_at LIMIT 1);
$$;
```

### GitHub Secrets の設定

| Secret名 | 値 |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase管理画面 > Settings > API > service_role key |

> ⚠️ `service_role key` は管理者権限のため、フロントエンドのコードには絶対に含めない

---

---

## 実装順序

| ステップ | 内容 | 優先度 |
|---|---|---|
| 1 | モックデータの用意（最初はsupabaseではなくコードで管理） | 高 |
| 2 | 共通レイヤー: `supabase.ts`、型定義、定数 | 高 |
| 3 | 認証: `LoginPage` + `useAuth` + 保護ルート | 高 |
| 4 | ホーム画面: `VoiceCard` + `VoiceGrid` + `VoicePage`（一覧取得） | 高 |
| 5 | 横スクロール2画面: `HomePage`（サトボイス + ミナボイスを並べる） | 高 |
| 6 | 再生画面: `PlayerPage` + `useAudioPlayer` | 高 |
| 7 | Supabase: テーブル・RLS・Storage・ユーザー作成 | 高 |
| 8 | 録音モーダル: `useRecorder` + `RecorderModal` + Storage アップロード | 高 |
| 9 | サムネイル機能: `ThumbnailPicker` + `useThumbnailUpload` | 中 |
| 10 | 削除機能: 論理削除 | 中 |
| 11 | Vercel デプロイ: 環境変数設定・動作確認 | 中 |
| 12 | GitHub Actions: keep-alive バッチ | 低 |

---

## 注意事項・メモ

- **iOS Safari の MediaRecorder**: `audio/webm` 非対応のため `audio/mp4` にフォールバック
  ```typescript
  const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
  ```
- **service_role key の扱い**: GitHub Secrets にのみ登録、フロントエンドには絶対に含めない
- **リアルタイム同期**: 相手の録音をすぐ反映したい場合は Supabase Realtime を追加（Phase 2）