// استيراد فايربيس
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// بيانات مشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.firebasestorage.app",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af3a3e29568130",
  measurementId: "G-VJVE851FEW"
};

// تشغيل فايربيس
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// الحارس الحقيقي
onAuthStateChanged(auth, (user) => {

  // إذا لم يكن مسجل دخول → اذهب لتسجيل الدخول
  if (!user) {
    if (!window.location.pathname.includes("login.html") &&
        !window.location.pathname.includes("register.html")) {
      window.location.href = "login.html";
    }
  }

  // إذا كان مسجل دخول وفتح صفحة تسجيل الدخول → خذه للرئيسية
  else {
    if (window.location.pathname.includes("login.html") ||
        window.location.pathname.includes("register.html")) {
      window.location.href = "home.html";
    }
  }

});

// زر تسجيل الخروج
window.logoutUser = function(){
  signOut(auth).then(()=>{
    window.location.href = "login.html";
  });
}
