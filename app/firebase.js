// فحص تسجيل الدخول
let currentUser = localStorage.getItem("chatUser");
if(!currentUser){
    window.location="../login.html";
}

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79N0",
  authDomain: "tttrt-b8c5a.firebaseapp.com",
  databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tttrt-b8c5a",
  storageBucket: "tttrt-b8c5a.appspot.com",
  messagingSenderId: "975123752593",
  appId: "1:975123752593:web:e591e930af101968875560"
};

// تحميل مكتبة فايربيس
var script1=document.createElement("script");
script1.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
document.head.appendChild(script1);

var script2=document.createElement("script");
script2.src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js";
document.head.appendChild(script2);

// تشغيل فايربيس
script2.onload=function(){
    firebase.initializeApp(firebaseConfig);
    window.db=firebase.database();
};
