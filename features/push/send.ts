import { webPush } from "./vapid";
import { db } from "@/features/shared/db";
import { pushSubscriptions } from "@/features/shared/db/schema";
import { eq } from "drizzle-orm";

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush.sendNotification(
        sub.subscriptionJson as webPush.PushSubscription,
        JSON.stringify(payload)
      )
    )
  );

  return results;
}
