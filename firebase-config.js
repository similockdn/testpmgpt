import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Cấu hình Firebase chính thức của SIMILOCK
const firebaseConfig = {
  apiKey: "AIzaSyAn0KxCUWbD-PieOL6Ro26rEXd_B9F1GnM",
  authDomain: "smilockdng.firebaseapp.com",
  projectId: "smilockdng",
  storageBucket: "smilockdng.firebasestorage.app",
  messagingSenderId: "245518310247",
  appId: "1:245518310247:web:9568fd36149523aa626dc2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
