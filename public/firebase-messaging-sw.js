importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
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


  const notificationTitle = payload.notification?.title || "Notification";

  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icon-192.png", // Optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
