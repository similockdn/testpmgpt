import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// GIỮ PROJECT FIREBASE CỦA SIMILOCK
// Lưu ý: nếu appId của bạn trong Firebase Console dài hơn, hãy copy đầy đủ dán vào đây.
const firebaseConfig = {
  apiKey: "AIzaSyAn0KxCUWbD-PieOL6Ro26rEXd_B9F1GnM",
  authDomain: "smilockdng.firebaseapp.com",
  projectId: "smilockdng",
  storageBucket: "smilockdng.firebasestorage.app",
  messagingSenderId: "245518310247",
  appId: "1:245518310247:web:956"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
