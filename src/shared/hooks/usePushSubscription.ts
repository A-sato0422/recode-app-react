import { useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../../features/auth/hooks/useAuth";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const saveSubscription = async (userId: string, subscription: PushSubscription) => {
  const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)));
  const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)));
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: userId, endpoint: subscription.endpoint, keys: { p256dh, auth } },
    { onConflict: "user_id" }
  );
  if (error) throw error;
};

export const usePushSubscription = () => {
  const { user } = useAuth();

  const subscribe = useCallback(async () => {
    if (!user || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    if ((await Notification.requestPermission()) !== "granted") return;

    try {
      console.log("[push] VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY);
      const reg = await navigator.serviceWorker.ready;
      console.log("[push] SW ready");

      const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer });
      console.log("[push] subscribed:", subscription.endpoint);

      await saveSubscription(user.id, subscription);
      console.log("[push] saved to Supabase");
    } catch (e) {
      console.error("[push] subscribe failed:", e);
    }
  }, [user]);

  return { subscribe };
};
