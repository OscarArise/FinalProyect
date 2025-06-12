// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCGCQRjKFe4Ejqh5xeWdzDZbkyTDDiY4zo",
  authDomain: "workspace-98be0.firebaseapp.com",
  projectId: "workspace-98be0",
  storageBucket: "workspace-98be0.firebasestorage.app",
  messagingSenderId: "765327139176",
  appId: "1:765327139176:web:c8f4df3e6b8083c2f776dd",
  measurementId: "G-393J38JTV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);