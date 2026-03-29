import webPush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

if (publicKey && privateKey && publicKey.length > 10 && privateKey.length > 10) {
  try {
    webPush.setVapidDetails(
      "mailto:alexteper99@gmail.com",
      publicKey,
      privateKey
    );
  } catch (e) {
    console.error("[Push] VAPID setup failed:", e);
  }
}

export { webPush };
