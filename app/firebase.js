// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "ضع_مفتاحك",
  authDomain: "ضع_الدومين.firebaseapp.com",
  databaseURL: "ضع_databaseURL",
  projectId: "ضع_projectId",
  storageBucket: "ضع_storage",
  messagingSenderId: "ضع_sender",
  appId: "ضع_appId"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);


// ⭐ هذا هو الحل الحقيقي ⭐
onAuthStateChanged(auth, (user) => {
  if (user) {
    // اذا كان المستخدم مسجل دخول انقله للتطبيق
    if (location.pathname.includes("login") || location.pathname.includes("register")) {
      window.location.href = "/80c/app/index.html";
    }
  }
});
