import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
getAuth, 
onAuthStateChanged, 
signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getDatabase,
ref,
set,
get,
child,
push,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

let currentUser = null;

/* مراقبة تسجيل الدخول */
onAuthStateChanged(auth, async (user) => {

if(!user){
if(!location.pathname.includes("index.html"))
window.location="index.html";
return;
}

currentUser=user;

/* حفظ المستخدم في قاعدة البيانات */
const userRef = ref(db, "users/"+user.uid);

set(userRef,{
email:user.email
});

});

/* تسجيل الخروج */
window.logoutUser = function(){
signOut(auth);
};

/* البحث عن مستخدم */
window.searchUser = async function(username){

const snapshot = await get(child(ref(db),"users"));

if(!snapshot.exists()){
alert("لا يوجد مستخدمين");
return;
}

const data=snapshot.val();
const list=document.getElementById("chatList");
list.innerHTML="";

Object.keys(data).forEach(uid=>{

if(data[uid].username && data[uid].username.includes(username)){

let div=document.createElement("div");
div.className="user";
div.innerText=data[uid].username;
div.onclick=()=>openChat(uid,data[uid].username);

list.appendChild(div);

}

});

}

/* فتح المحادثة */
window.openChat = function(uid,name){

window.chatUser=uid;

document.getElementById("chatWindow").style.display="flex";
document.getElementById("messages").innerHTML="";

const chatId = [currentUser.uid,uid].sort().join("_");

const msgRef = ref(db,"messages/"+chatId);

onValue(msgRef,(snapshot)=>{

document.getElementById("messages").innerHTML="";

snapshot.forEach(child=>{

let m=child.val();

let div=document.createElement("div");
div.className="msg";
div.innerText=m.text;

document.getElementById("messages").appendChild(div);

});

});

}

/* ارسال رسالة */
window.sendMsg = function(){

const text=document.getElementById("msgInput").value;
if(text=="") return;

const chatId = [currentUser.uid,chatUser].sort().join("_");

push(ref(db,"messages/"+chatId),{
text:text,
sender:currentUser.uid,
time:Date.now()
});

document.getElementById("msgInput").value="";

};
