import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:alexteper99@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export { webPush };
