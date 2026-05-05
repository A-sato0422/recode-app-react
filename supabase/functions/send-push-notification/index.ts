import webpush from "npm:web-push";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  const payload = await req.json();
  const record = payload.record as { user_id: string; label: string };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .neq("user_id", record.user_id);

  if (!subscriptions || subscriptions.length === 0) {
    return new Response("no subscribers", { status: 200, headers: corsHeaders });
  }

  const notification = JSON.stringify({
    title: "新しい音声が届きました",
    body: record.label,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, notification)
    )
  );

  // 無効になったエンドポイント（410 Gone）を削除
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected" && result.reason?.statusCode === 410) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", subscriptions[i].endpoint);
    }
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
