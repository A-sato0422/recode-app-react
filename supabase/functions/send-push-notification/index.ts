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
  console.log("[push] record.user_id:", record.user_id, "label:", record.label);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: subscriptions, error: queryError } = await supabase
    .from("push_subscriptions")
    .select("*")
    .neq("user_id", record.user_id);

  console.log("[push] subscriptions found:", subscriptions?.length ?? 0, "queryError:", queryError?.message ?? "none");

  if (!subscriptions || subscriptions.length === 0) {
    return new Response("no subscribers", { status: 200, headers: corsHeaders });
  }

  const notification = JSON.stringify({
    title: "新しい音声が届きました",
    body: record.label,
  });

  console.log("[push] sending to", subscriptions.length, "subscriber(s)");
  console.log("[push] VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY?.slice(0, 20));
  console.log("[push] VAPID_SUBJECT:", VAPID_SUBJECT);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, notification)
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      console.log("[push] success:", result.value.statusCode);
    } else {
      console.error("[push] failed:", result.reason?.statusCode, result.reason?.body ?? result.reason?.message);
      if (result.reason?.statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscriptions[i].endpoint);
      }
    }
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
