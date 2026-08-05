

// import { initializeApp } from "firebase/app";
// import { getMessaging, isSupported } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: "AIzaSyAu2YeaoxPIpLbKEHwzHqdeCm3wDACdQX0",
//   authDomain: "everyone-courier-notifications.firebaseapp.com",
//   projectId: "everyone-courier-notifications",
//   storageBucket: "everyone-courier-notifications.firebasestorage.app",
//   messagingSenderId: "477281311611",
//   appId: "1:477281311611:web:9daa6d36da6bb517f5bbde",
//   measurementId: "G-1BWG5XWRKT",
// };

// const app = initializeApp(firebaseConfig);

// export { app, isSupported };

// export const getFirebaseMessaging = async () => {
//   const supported = await isSupported();

//   if (!supported) {
//     return null;
//   }

//   return getMessaging(app);
// };



import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

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

// Firebase Authentication
export const auth = getAuth(app);

// Phone Authentication
export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
};

// Firebase Cloud Messaging
export { app, isSupported };

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  return getMessaging(app);
};