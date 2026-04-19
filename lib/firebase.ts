// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWdiGrO7_vQ-ZhP6DHgTLm_NY8n7yuIfI",
  authDomain: "bashan-fire-app-6ff3a.firebaseapp.com",
  projectId: "bashan-fire-app-6ff3a",
  storageBucket: "bashan-fire-app-6ff3a.firebasestorage.app",
  messagingSenderId: "886377201550",
  appId: "1:886377201550:web:53a577ab1c53520cfb2edf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);