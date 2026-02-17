// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// بيانات مشروعك
const firebaseConfig = {
  apiKey: "PUT_API_KEY_HERE",
  authDomain: "PUT_DOMAIN_HERE",
  databaseURL: "PUT_DATABASE_URL_HERE",
  projectId: "PUT_PROJECT_ID_HERE",
  storageBucket: "PUT_BUCKET_HERE",
  messagingSenderId: "PUT_SENDER_ID_HERE",
  appId: "PUT_APP_ID_HERE"
};

// تشغيل فايربيس
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

// أهم جزء (اسمع جيداً 👇)
onAuthStateChanged(auth, (user) => {

  // اذا المستخدم مسجل دخول
  if (user) {

    // نحن في صفحة تسجيل او تسجيل دخول
    if (
      window.location.pathname.includes("login") ||
      window.location.pathname.includes("register")
    ) {
      window.location.href = "index.html";
    }

  } else {

    // اذا ليس مسجل دخول وهو داخل الصفحة الرئيسية
    if (window.location.pathname.includes("index.html")) {
      window.location.href = "login.html";
    }

  }

});
