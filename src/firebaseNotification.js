import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY =
  "BADctGxuMz2FEnz8bxJPCieRNbDTHRGYWptZ0ZA0KuN9UtuW6wAvTVNscB97w3ea3zPy5J60XiGF6JsOP1tpEEY";


export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {

      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
  
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!fcmToken) {

      return null;
    }

    const deviceData = {
      device_type: "WEB",
      fcm_token: fcmToken,
    };

    return deviceData;
  } catch (error) {
    return null;
  }
};

export const listenForMessages = async () => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("Foreground Notification:", payload);
  });
};