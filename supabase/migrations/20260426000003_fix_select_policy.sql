-- SELECT ポリシーの is_deleted フィルタを削除
-- UPDATE後に is_deleted = true になった行がSELECTポリシーを
-- 満たさずエラーになるため、DBレベルのフィルタを除去する
-- （アプリ側の .eq("is_deleted", false) で代替）
DROP POLICY "anyone can read active voices" ON voices;

CREATE POLICY "anyone can read voices"
  ON voices FOR SELECT
  USING (true);
