ALTER TABLE voices ADD COLUMN sort_order INTEGER DEFAULT NULL;

-- 既存レコードを初期化（古い→1、新しい→最大値。DESC sortで新しいものが先頭）
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn
  FROM voices
  WHERE is_deleted = FALSE
)
UPDATE voices
SET sort_order = ranked.rn
FROM ranked
WHERE voices.id = ranked.id;

CREATE INDEX idx_voices_user_sort ON voices (user_id, sort_order ASC NULLS LAST);
