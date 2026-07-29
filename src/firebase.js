// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBhmQZ3bmjsVI4pQgthgIDrDmf_fb9yf_o",
//   authDomain: "notification-6ea35.firebaseapp.com",
//   projectId: "notification-6ea35",
//   storageBucket: "notification-6ea35.firebasestorage.app",
//   messagingSenderId: "51115094303",
//   appId: "1:51115094303:web:87dd2d46b4d2b888e4802a",
//   measurementId: "G-K832BPTQ93"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAu2YeaoxPIpLbKEHwzHqdeCm3wDACdQX0",
  authDomain: "everyone-courier-notifications.firebaseapp.com",
  projectId: "everyone-courier-notifications",
  storageBucket: "everyone-courier-notifications.firebasestorage.app",
  messagingSenderId: "477281311611",
  appId: "1:477281311611:web:9daa6d36da6bb517f5bbde",
  measurementId: "G-1BWG5XWRKT",
};

const app = initializeApp(firebaseConfig);

export { app, isSupported };

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  return getMessaging(app);
};
