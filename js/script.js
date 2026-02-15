// إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79N0",
    authDomain: "tttrt-b8c5a.firebaseapp.com",
    databaseURL: "https:                                                                 
    projectId: "//tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tttrt-b8c5a",
    storageBucket: "tttrt-b8c5a.appspot.com",
    messagingSenderId: "975123752593",
    appId: "1:975123752593:web:e591e930af101968875560",
    measurementId: "G-VJVEB51FEW"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// إضافة الكود الخاص بالتسجيل الدخول والخروج هنا
document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // إضافة الكود الخاص بالتسجيل الدخول هنا
    console.log('تسجيل الدخول', username, password);
});
