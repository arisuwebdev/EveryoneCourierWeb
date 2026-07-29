import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY =
  "BADctGxuMz2FEnz8bxJPCieRNbDTHRGYWptZ0ZA0KuN9UtuW6wAvTVNscB97w3ea3zPy5J60XiGF6JsOP1tpEEY";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.log("Firebase Messaging is not supported.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log("FCM Token:", token);

      // TODO:
      // Send this token to your backend API
      return token;
    }

    console.log("No registration token available.");
    return null;
  } catch (error) {
    console.error("Notification Error:", error);
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