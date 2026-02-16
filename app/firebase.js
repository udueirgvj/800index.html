// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79N0",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.appspot.com",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af101968875560"
};

// تشغيل Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

/* مراقبة تسجيل الدخول (هذا هو الجزء المهم) */
auth.onAuthStateChanged(function(user) {

  // اذا المستخدم مسجل دخول
  if (user) {

    // لو نحن في صفحة login او register → اذهب للرئيسية
    if (
      location.pathname.includes("login") ||
      location.pathname.includes("register") ||
      location.pathname.includes("index")
    ) {
      window.location.href = "chat.html";
    }

  } 
  // اذا غير مسجل
  else {

    // لو فتح صفحة الشات بدون تسجيل
    if (location.pathname.includes("chat.html")) {
      window.location.href = "login.html";
    }

  }
});
