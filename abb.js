// استيراد دوال Firebase (تأكد من تثبيت الحزم أو استخدام CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, query, orderByChild, startAt, endAt, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";

// إعدادات Firebase الخاصة بك (من الصورة التي أرسلتها)
const firebaseConfig = {
    apiKey: "AIzaSyDRCtfuYrEdnuKUsWu_79NC6G_xGLznBJc",
    authDomain: "tttrt-b8c5a.firebaseapp.com",
    databaseURL: "https://tttrt-b8c5a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tttrt-b8c5a",
    storageBucket: "tttrt-b8c5a.firebasestorage.app",
    messagingSenderId: "975123752593",
    appId: "1:975123752593:web:e591e930af3a3e29568130",
    measurementId: "G-VJVE851FEW"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// دالة البحث عن المستخدمين
async function searchUsers(searchText) {
    if (!searchText || searchText.length < 2) return []; // البحث يحتاج حرفين على الأقل

    const usersRef = ref(database, 'users');
    const searchTerm = searchText.toLowerCase();

    // إنشاء استعلام للبحث عن username يبدأ بـ searchTerm
    const userQuery = query(
        usersRef,
        orderByChild('username'),
        startAt(searchTerm),
        endAt(searchTerm + "\uf8ff")
    );

    try {
        const snapshot = await get(userQuery);
        const results = [];
        snapshot.forEach((childSnapshot) => {
            results.push({
                uid: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        return results;
    } catch (error) {
        console.error("خطأ في البحث:", error);
        return [];
    }
}

// عناصر الواجهة
const searchToggle = document.getElementById('searchToggle');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// إظهار نافذة البحث عند النقر على زر البحث
searchToggle.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus(); // التركيز على حقل الإدخال
});

// إخفاء النافذة عند النقر على زر الإغلاق
closeSearch.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    searchInput.value = ''; // تفريغ الحقل
    searchResults.innerHTML = ''; // تفريغ النتائج
});

// البحث عند الكتابة
searchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    if (term.length < 2) {
        searchResults.innerHTML = '<div class="no-results">اكتب حرفين على الأقل</div>';
        return;
    }

    const users = await searchUsers(term);

    if (users.length > 0) {
        searchResults.innerHTML = users.map(user => `
            <div class="result-item" data-uid="${user.uid}">
                <strong>${user.displayName || user.username}</strong>
                <small>@${user.username}</small>
            </div>
        `).join('');
    } else {
        searchResults.innerHTML = '<div class="no-results">لا يوجد مستخدم بهذا الاسم</div>';
    }
});

// عند النقر على نتيجة (يمكنك إضافة حدث لبدء محادثة)
searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.result-item');
    if (item) {
        const uid = item.dataset.uid;
        // هنا يمكنك التوجيه إلى صفحة المحادثة مع هذا المستخدم
        console.log('تم اختيار مستخدم:', uid);
        // مثال: window.location.href = `chat.html?uid=${uid}`;
        
        // إخفاء البحث بعد الاختيار
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
});

// إغلاق النافذة عند النقر خارجها (اختياري)
searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
});
