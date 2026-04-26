import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SATOSHI_USER_ID = process.env.VITE_SATOSHI_USER_ID;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SATOSHI_USER_ID) {
  console.error('必要な環境変数が未設定です: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SATOSHI_USER_ID');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const audioDir = join(__dirname, '../public/audio');
const files = readdirSync(audioDir).filter(f => extname(f) !== '');

console.log(`${files.length} 件の音声ファイルを挿入します...\n`);

for (const file of files) {
  const filePath = join(audioDir, file);
  const buffer = readFileSync(filePath);
  const ext = extname(file);
  const label = basename(file, ext);
  const storagePath = `${SATOSHI_USER_ID}/${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('voice-recordings')
    .upload(storagePath, buffer, { contentType: 'audio/mp4' });

  if (uploadError) {
    console.error(`✗ ${file} アップロード失敗:`, uploadError.message);
    continue;
  }

  const { error: insertError } = await supabase
    .from('voices')
    .insert({
      user_id: SATOSHI_USER_ID,
      label,
      audio_path: storagePath,
      duration: null,
    });

  if (insertError) {
    console.error(`✗ ${file} DB挿入失敗:`, insertError.message);
    continue;
  }

  console.log(`✓ ${file} → label: "${label}"`);
}

console.log('\n完了');
