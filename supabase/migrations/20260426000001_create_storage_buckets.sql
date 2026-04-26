-- Storage バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-thumbnails', 'voice-thumbnails', true);

-- voice-recordings のアクセスポリシー
CREATE POLICY "public can read voice recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-recordings');

CREATE POLICY "users can upload own voice recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can delete own voice recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- voice-thumbnails のアクセスポリシー
CREATE POLICY "public can read voice thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-thumbnails');

CREATE POLICY "users can upload own voice thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can delete own voice thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
