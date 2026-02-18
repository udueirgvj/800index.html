import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  projectId: "tttrt-b8c5a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

  const page = window.location.pathname.split("/").pop();

  // إذا المستخدم غير مسجل
  if (!user && page === "home.html") {
    window.location.replace("index.html");
  }

  // إذا المستخدم مسجل
  if (user && page === "index.html") {
    window.location.replace("home.html");
  }

});
