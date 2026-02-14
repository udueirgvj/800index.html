// ===================================================
// loader.js - تحميل جميع ملفات التطبيق بالترتيب
// ===================================================

// قائمة الملفات بالترتيب المطلوب
const files = [
    'js/firebase-config.js',
    'js/auth.js',
    'js/bots.js',
    'js/support.js',
    'js/groups.js',
    'js/chat.js',
    'js/app.js'
];

// دالة لتحميل ملف script بشكل متسلسل
function loadScript(index) {
    if (index >= files.length) return; // انتهى التحميل

    const script = document.createElement('script');
    script.src = files[index];
    script.onload = () => loadScript(index + 1); // تحميل التالي بعد انتهاء الحالي
    script.onerror = () => console.error('خطأ في تحميل الملف:', files[index]);
    document.head.appendChild(script);
}

// بدء التحميل من أول ملف
loadScript(0);
