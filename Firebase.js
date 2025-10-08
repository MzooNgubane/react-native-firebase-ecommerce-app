import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";   
const firebaseConfig = {
  apiKey: "AIzaSyBx9zR1-nYD3r1MwngB_yoK03vkB8OCEo8",
  authDomain: "semestertest2.firebaseapp.com",
  projectId: "semestertest2",
  storageBucket: "semestertest2.firebasestorage.app",
  messagingSenderId: "866056193627",
  appId: "1:866056193627:web:8babd4d7dc6b8bca79a17e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);   
