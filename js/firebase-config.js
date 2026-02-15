// ==================== firebase-config.js ====================
const firebaseConfig = {
    apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79N0",
    authDomain: "tttrt-b8c5a.firebaseapp.com",
    databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tttrt-b8c5a",
    storageBucket: "tttrt-b8c5a.appspot.com",
    messagingSenderId: "975123752593",
    appId: "1:975123752593:web:e591e930af101968875560"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

window.db = db;
window.auth = auth;
