"use client";

import { useEffect } from "react";

export function PushRegistration() {
  useEffect(() => {
    registerAndSchedule();
  }, []);

  async function registerAndSchedule() {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      if ("PushManager" in window) {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        } catch {
          // Push subscription failed — continue with local notifications
        }
      }

      scheduleLocalNotifications();
      checkTurnNotification();
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }

  async function scheduleLocalNotifications() {
    try {
      const res = await fetch("/api/push/today-rituals");
      if (!res.ok) return;
      const rituals: { descripcion: string; horaInicio: string }[] = await res.json();

      const now = new Date();

      for (const ritual of rituals) {
        const [hours, minutes] = ritual.horaInicio.split(":").map(Number);
        const ritualTime = new Date(now);
        ritualTime.setHours(hours, minutes, 0, 0);

        const delay = ritualTime.getTime() - now.getTime();
        if (delay > 0) {
          setTimeout(() => {
            new Notification("🔥 Ritual", {
              body: ritual.descripcion,
              icon: "/icons/icon-192.png",
            });
          }, delay);
        }
      }
    } catch {
      // Silent fail
    }
  }

  async function checkTurnNotification() {
    try {
      const res = await fetch("/api/push/check-turn");
      if (!res.ok) return;
      const { isMyTurn } = await res.json();

      if (isMyTurn) {
        setTimeout(() => {
          new Notification("📖 Es tu turno", {
            body: "Escribí tu parte de la historia de Valdris",
            icon: "/icons/icon-192.png",
          });
        }, 2000);
      }
    } catch {
      // Silent fail
    }
  }

  return null;
}
