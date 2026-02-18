import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { setDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// إنشاء حساب
export async function register(email, password, username){

  if(username.startsWith("@"))
    username = username.slice(1);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username: username.toLowerCase(),
    email: email,
    bio: "",
    photo: "",
    createdAt: Date.now()
  });

  alert("تم إنشاء الحساب");
}

// تسجيل دخول
export async function login(email, password){
  await signInWithEmailAndPassword(auth, email, password);
  alert("تم تسجيل الدخول");
}
