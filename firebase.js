<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>إنشاء حساب - Clipn</title>

<style>
body{
    margin:0;
    font-family:Arial;
    background:#061b24;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.box{
    width:90%;
    max-width:400px;
    background:#0d2b38;
    padding:25px;
    border-radius:15px;
    text-align:center;
}

h2{
    margin-bottom:20px;
}

input{
    width:100%;
    padding:14px;
    margin:8px 0;
    border:none;
    border-radius:8px;
    font-size:16px;
}

button{
    width:100%;
    padding:14px;
    margin-top:10px;
    background:#2ecc71;
    border:none;
    border-radius:8px;
    color:white;
    font-size:18px;
    cursor:pointer;
}

button:active{
    transform:scale(0.97);
}

a{
    color:#7cc7ff;
    text-decoration:none;
    display:block;
    margin-top:15px;
}
</style>
</head>

<body>

<div class="box">
    <h2>إنشاء حساب</h2>

    <!-- مهم: منع إعادة تحميل الصفحة -->
    <form id="registerForm" onsubmit="return false;">

        <input id="username" type="text" placeholder="اسم المستخدم (5 احرف على الأقل)">
        <input id="email" type="email" placeholder="البريد الإلكتروني">
        <input id="password" type="password" placeholder="كلمة المرور">

        <!-- مهم: type=button -->
        <button type="button" id="registerBtn">إنشاء الحساب</button>

    </form>

    <a href="login.html">لديك حساب؟ تسجيل الدخول</a>
</div>

<!-- Firebase config -->
<script type="module" src="firebase.js"></script>

<!-- register logic -->
<script type="module">
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, set }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const btn = document.getElementById("registerBtn");

btn.onclick = async () => {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(username.length < 5){
        alert("اسم المستخدم يجب أن يكون 5 أحرف على الأقل");
        return;
    }

    if(email === "" || password === ""){
        alert("اكمل جميع الحقول");
        return;
    }

    try{

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // حفظ بيانات المستخدم
        await set(ref(db, "users/" + user.uid), {
            username: username,
            email: email,
            uid: user.uid
        });

        alert("تم إنشاء الحساب بنجاح");

        // الانتقال للصفحة الرئيسية
        window.location.href = "index.html";

    }catch(error){
        alert(error.message);
    }
};
</script>

</body>
</html>
