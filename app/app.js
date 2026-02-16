// مراقبة حالة تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {

  // اذا المستخدم مسجل دخول
  if (user) {

    // نحن الآن في صفحة التسجيل
    if (window.location.pathname.includes("signup.html")) {
      window.location.href = "index.html";
    }

    // نحن في صفحة تسجيل الدخول
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "index.html";
    }

  } else {

    // اذا لم يكن مسجل دخول وتم فتح الصفحة الرئيسية
    if (window.location.pathname.includes("index.html")) {
      window.location.href = "login.html";
    }

  }
});
