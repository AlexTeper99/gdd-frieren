import webPush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webPush.setVapidDetails(
    "mailto:alexteper99@gmail.com",
    publicKey,
    privateKey
  );
}

export { webPush };
