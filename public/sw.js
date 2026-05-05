self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "新しい音声が届きました", {
      body: data.body ?? "",
      icon: "/apple-touch-icon.png",
      badge: "/apple-touch-icon.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        // すでにログイン画面を開いている場合、新規タブを開かない
        if (client.url.includes("/login") && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/login");
    })
  );
});
