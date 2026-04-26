-- voices テーブル
CREATE TABLE voices (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id),
  label          TEXT        NOT NULL,
  audio_path     TEXT        NOT NULL,
  thumbnail_path TEXT        DEFAULT NULL,
  duration       NUMERIC     DEFAULT NULL,
  is_deleted     BOOLEAN     DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  keep_alive_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS ポリシー
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read active voices"
  ON voices FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "users can insert own voices"
  ON voices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own voices"
  ON voices FOR UPDATE
  USING (auth.uid() = user_id);

-- keep_alive_ping RPC 関数（GitHub Actions用）
CREATE OR REPLACE FUNCTION keep_alive_ping()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE voices
  SET keep_alive_at = now()
  WHERE id = (SELECT id FROM voices ORDER BY created_at LIMIT 1);
$$;
