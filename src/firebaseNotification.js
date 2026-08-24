// import { getToken, onMessage } from "firebase/messaging";
// import { getFirebaseMessaging } from "./firebase";

// const VAPID_KEY =
//   "BADctGxuMz2FEnz8bxJPCieRNbDTHRGYWptZ0ZA0KuN9UtuW6wAvTVNscB97w3ea3zPy5J60XiGF6JsOP1tpEEY";

// export const requestNotificationPermission = async () => {
//   try {
//     const permission = await Notification.requestPermission();

//     if (permission !== "granted") {
//       return null;
//     }

//     const messaging = await getFirebaseMessaging();

//     if (!messaging) {
//       return null;
//     }

//     const fcmToken = await getToken(messaging, {
//       vapidKey: VAPID_KEY,
//     });

//     console.log("🔥 Current FCM Token:", fcmToken);

//     if (!fcmToken) {
//       return null;
//     }

//     const deviceData = {
//       device_type: "WEB",
//       fcm_token: fcmToken,
//     };

//     return deviceData;
//   } catch (error) {
//     return null;
//   }
// };

// export const listenForMessages = async () => {
//   try {
//     const messaging = await getFirebaseMessaging();

//     if (!messaging) {
//       console.log("Firebase messaging unavailable");
//       return;
//     }

//     onMessage(messaging, (payload) => {
//       console.log("🔥 FCM message received:", payload);

//       const title = payload.notification?.title || "Everyone Courier";

//       const body = payload.notification?.body || "You have a new notification";

//       if (Notification.permission === "granted") {
//         new Notification(title, {
//           body,
//           icon: "/logo.png",
//         });
//       }
//     });
//   } catch (error) {
//     console.error("FCM listener error:", error);
//   }
// };



import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY =
  "BADctGxuMz2FEnz8bxJPCieRNbDTHRGYWptZ0ZA0KuN9UtuW6wAvTVNscB97w3ea3zPy5J60XiGF6JsOP1tpEEY";

export const requestNotificationPermission = async () => {
  try {
    // console.log("🔔 Requesting notification permission...");

    const permission = await Notification.requestPermission();

    // console.log("🔔 Notification permission:", permission);

    if (permission !== "granted") {
      // console.log("❌ Notification permission not granted");
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      // console.log("❌ Firebase messaging is not supported");
      return null;
    }

    // console.log("✅ Firebase messaging initialized");

    const registration =
      await navigator.serviceWorker.getRegistration(
        "/current-project/react-project/EveryoneCourior/"
      );

    // console.log("🔧 Firebase service worker:", registration);

    if (!registration) {
      // console.error("❌ Firebase service worker not found");
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    // console.log("🔥 Current FCM Token:", fcmToken);

    if (!fcmToken) {
      // console.log("❌ FCM token is empty");
      return null;
    }

    const deviceData = {
      device_type: "WEB",
      fcm_token: fcmToken,
    };

    // console.log("📱 Device notification data:", deviceData);

    return deviceData;
  } catch (error) {
    // console.error("❌ FCM TOKEN ERROR:", error);
    return null;
  }
};

export const listenForMessages = async () => {
  try {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      // console.log("❌ Firebase messaging unavailable");
      return;
    }

    // console.log("✅ FCM listener started");

    onMessage(messaging, (payload) => {
      // console.log("🔥🔥 FCM MESSAGE RECEIVED 🔥🔥");
      // console.log("📦 Full payload:", payload);
      // console.log("🔔 Notification:", payload.notification);
      // console.log("📊 Data:", payload.data);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "Everyone Courier";

      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "You have a new notification";

      // console.log("📌 Title:", title);
      // console.log("📌 Body:", body);
      // console.log("🔐 Permission:", Notification.permission);

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo.png",
        });

        // console.log("✅ Browser notification displayed");
      } else {
        // console.log("❌ Notification permission is not granted");
      }
    });
  } catch (error) {
    console.error("❌ FCM listener error:", error);
  }
};