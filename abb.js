import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* بيانات مشروعك */
const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.firebasestorage.app",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af3a3e29568130"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* الحارس (منع الدخول بدون تسجيل) */
onAuthStateChanged(auth, (user) => {
  if(!user){
    window.location.href="index.html";
  }
});

/* تسجيل الخروج */
window.logoutUser = function(){
  signOut(auth).then(()=>{
    window.location.href="index.html";
  });
};

/* حفظ بيانات المستخدم بعد التسجيل */
window.saveUserData = async function(uid, name, username, email){
  await set(ref(db,"users/"+username),{
    uid:uid,
    name:name,
    username:username,
    email:email
  });
};

/* البحث عن مستخدم */
window.searchUser = async function(username){
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef,"users/"+username));

  if(snapshot.exists()){
    return snapshot.val();
  }else{
    return null;
  }
};
