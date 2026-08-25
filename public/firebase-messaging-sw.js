// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
// );

// firebase.initializeApp({
//   apiKey: "AIzaSyAu2YeaoxPIpLbKEHwzHqdeCm3wDACdQX0",
//   authDomain: "everyone-courier-notifications.firebaseapp.com",
//   projectId: "everyone-courier-notifications",
//   storageBucket: "everyone-courier-notifications.firebasestorage.app",
//   messagingSenderId: "477281311611",
//   appId: "1:477281311611:web:9daa6d36da6bb517f5bbde",
//   measurementId: "G-1BWG5XWRKT",
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   const notificationTitle = payload.notification?.title || "Notification";

//   const notificationOptions = {
//     body: payload.notification?.body,
//     icon: "/icon-192.png",
//   };

//   self.registration.showNotification(
//     notificationTitle,
//     notificationOptions
//   );
// });


importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAu2YeaoxPIpLbKEHwzHqdeCm3wDACdQX0",
  authDomain: "everyone-courier-notifications.firebaseapp.com",
  projectId: "everyone-courier-notifications",
  storageBucket: "everyone-courier-notifications.firebasestorage.app",
  messagingSenderId: "477281311611",
  appId: "1:477281311611:web:9daa6d36da6bb517f5bbde",
  measurementId: "G-1BWG5XWRKT",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log("🔥 Background FCM message:", payload);

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "Everyone Courier";

  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "You have a new notification";

  const notificationUrl =
    payload.data?.url ||
    "/current-project/react-project/EveryoneCourior/dashboard";

  const notificationOptions = {
    body: notificationBody,
    icon: "/current-project/react-project/EveryoneCourior/icon-192.png",

    data: {
      url: notificationUrl,
    },
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});


// 🔔 Notification click
self.addEventListener("notificationclick", (event) => {
  // console.log("🔔 Notification clicked");

  event.notification.close();

  const urlToOpen =
    event.notification.data?.url ||
    "/current-project/react-project/EveryoneCourior/dashboard";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {

      // If your website is already open, use the existing tab
      for (const client of clientList) {
        if (
          client.url.includes(
            "/current-project/react-project/EveryoneCourior"
          ) &&
          "focus" in client
        ) {
          return client.focus().then(() => {
            if ("navigate" in client) {
              return client.navigate(urlToOpen);
            }
          });
        }
      }

      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});